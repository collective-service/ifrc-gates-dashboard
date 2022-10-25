import { useCallback, useState, useRef } from 'react';
import Papa from 'papaparse';

import {
    UrlParams,
    prepareUrlParams,
    prepareUrl,
} from '#base/utils/restRequest';

const PAGE_SIZE = 3000;

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
    limit,
    onFailure,
    totalCount,
    noOfRetries = 0,
} : {
    url: string,
    urlParams: UrlParams,
    onPartialSuccess: (data: string) => void,
    onSuccess: () => void,
    offset: number,
    limit: number,
    onFailure: (error: unknown) => void,
    totalCount: number,
    noOfRetries?: number,
}) {
    const response = await fetchData(
        url,
        {
            ...urlParams,
            offset,
            limit,
        },
    );
    if (response.status >= 200 && response.status <= 299) {
        onPartialSuccess(response.data);
        if ((offset + limit) <= totalCount) {
            await wait((noOfRetries ** 2) * 500);
            await fetchRecursive({
                url,
                urlParams,
                onPartialSuccess,
                offset: offset + limit,
                limit,
                onSuccess,
                onFailure,
                totalCount,
                noOfRetries: Math.max(0, noOfRetries - 1),
            });
        } else {
            onSuccess();
        }
    } else if (response.status === 429) {
        await wait((noOfRetries ** 2) * 1000);
        await fetchRecursive({
            url,
            urlParams,
            onPartialSuccess,
            offset,
            limit,
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
} : {
    onFailure: (error: unknown) => void;
}) {
    const [pending, setPending] = useState(false);
    const [data, setData] = useState<D[]>([]);
    const [fullCsvString, setFullCsvString] = useState<string>('');

    const totalRef = useRef(0);

    const handleFailure = useCallback((error: unknown) => {
        setData([]);
        setFullCsvString('');
        totalRef.current = 0;
        setPending(false);
        onFailure(error);
    }, [onFailure]);

    const handleSuccess = useCallback(() => {
        setPending(false);
    }, []);

    const handlePartialSuccess = useCallback((newResponse: string) => {
        Papa.parse(newResponse, {
            complete: (test: { data: D[] }) => {
                const items = [...test.data];
                items.pop();
                setData((prevData) => [...prevData, ...items]);
                setFullCsvString((prevString) => (
                    prevString.length > 0
                        ? `${prevString},${newResponse}`
                        : newResponse
                ));
            },
        });
    }, []);

    const trigger = useCallback((url: string, total: number, newUrlParams: UrlParams) => {
        // NOTE: Clearing data during trigger as data and total are preserved outputs
        setData([]);
        totalRef.current = total;
        setFullCsvString('');
        setPending(true);
        fetchRecursive({
            url,
            urlParams: newUrlParams,
            offset: 0,
            limit: PAGE_SIZE,
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

    const cancel = useCallback(() => {
        setData([]);
        setFullCsvString('');
        totalRef.current = 0;
        setPending(false);
    }, []);

    return [pending, data, fullCsvString, totalRef.current, trigger, cancel] as const;
}

export default useRecursiveCSVRequest;
