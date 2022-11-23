import { useCallback, useState, useRef } from 'react';
import Papa from 'papaparse';

import {
    UrlParams,
    prepareUrlParams,
    prepareUrl,
} from '#base/utils/restRequest';

// NOTE: we can use upto 4000
const PAGE_SIZE = 2000;

async function wait(time: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), time);
    });
}

async function fetchData(url: string, urlParams: UrlParams) {
    const finalUrl = `${prepareUrl(url)}?${prepareUrlParams(urlParams)}`;
    const response = await fetch(
        finalUrl,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'test/csv; charset=utf-8',
            },
        },
    );
    const finalText = await response.text();

    return {
        data: finalText,
        status: response.status,
    };
}

async function fetchRecursive({
    url,
    urlParams,
    onPartialSuccess,
    onSuccess,
    offset,
    pageLimit,
    onFailure,
    totalCount,
    noOfRetries = 0,
} : {
    url: string,
    urlParams: UrlParams,
    onPartialSuccess: (data: string) => void,
    onSuccess: () => void,
    offset: number,
    pageLimit: number,
    onFailure: (error: unknown) => void,
    totalCount: number,
    noOfRetries?: number,
}) {
    const response = await fetchData(
        url,
        {
            ...urlParams,
            offset,
            limit: pageLimit,
        },
    );
    if (response.status >= 200 && response.status <= 299) {
        onPartialSuccess(response.data);

        const newOffset = offset + pageLimit;

        if (newOffset < totalCount) {
            await wait((noOfRetries ** 2) * 500 + Math.random() * 200);
            await fetchRecursive({
                url,
                urlParams,
                onPartialSuccess,
                offset: newOffset,
                pageLimit,
                onSuccess,
                onFailure,
                totalCount,
                noOfRetries: Math.max(0, noOfRetries - 1),
            });
        } else {
            onSuccess();
        }
    } else if (response.status === 429) {
        await wait((noOfRetries ** 2) * 1000 + Math.random() * 1000);
        await fetchRecursive({
            url,
            urlParams,
            onPartialSuccess,
            offset,
            pageLimit,
            onSuccess,
            onFailure,
            totalCount,
            noOfRetries: noOfRetries + 1,
        });
    } else {
        onFailure(response?.data);
    }
}

function useRecursiveCSVRequest<D>({
    onFailure,
    onSuccess,
} : {
    onFailure: (error: unknown) => void;
    onSuccess: (data: D[], total: number) => void;
}) {
    const [pending, setPending] = useState(false);
    const [progress, setProgress] = useState(0);

    const dataRef = useRef<D[]>([]);
    const totalRef = useRef(0);

    const handleFailure = useCallback((error: unknown) => {
        dataRef.current = [];
        totalRef.current = 0;

        setPending(false);
        setProgress(0);

        onFailure(error);
    }, [onFailure]);

    const handleSuccess = useCallback(() => {
        const data = dataRef.current;
        const total = totalRef.current;

        dataRef.current = [];
        totalRef.current = 0;

        setPending(false);
        setProgress(0);

        if (total !== data.length - 1) {
            // eslint-disable-next-line no-console
            console.error(`Length mismatch. Expected ${total} but got ${data.length - 1}`);
            onFailure(undefined);
        } else {
            onSuccess(data, total);
        }
    }, [onSuccess, onFailure, setPending, setProgress]);

    const handlePartialSuccess = useCallback((newResponse: string) => {
        Papa.parse(
            newResponse,
            {
                skipEmptyLines: true,
                complete: (test: { data: D[] }) => {
                    const items = [...test.data];

                    // NOTE: meaning this is not the first request
                    if (dataRef.current.length > 0) {
                        // NOTE: remove the headers
                        items.shift();
                    }

                    dataRef.current = [
                        ...dataRef.current,
                        ...items,
                    ];

                    if (totalRef.current === 0 || dataRef.current.length === 0) {
                        setProgress(0);
                    } else {
                        // NOTE: we are negating one because we have a header as well
                        setProgress((dataRef.current.length - 1) / totalRef.current);
                    }
                },
            },
        );
    }, []);

    const trigger = useCallback((url: string, total: number, newUrlParams: UrlParams) => {
        dataRef.current = [];
        totalRef.current = total;

        setPending(true);
        setProgress(0);

        fetchRecursive({
            url,
            urlParams: newUrlParams,
            offset: 0,
            pageLimit: PAGE_SIZE,
            onPartialSuccess: handlePartialSuccess,
            onSuccess: handleSuccess,
            onFailure: handleFailure,
            totalCount: total,
        });
    }, [
        handleSuccess,
        handlePartialSuccess,
        handleFailure,
    ]);

    return [pending, progress, trigger] as const;
}

export default useRecursiveCSVRequest;
