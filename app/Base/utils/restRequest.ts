import {
    RequestContext,
    useRequest as useMyRequest,
    RequestOptions,
    useLazyRequest as useMyLazyRequest,
    LazyRequestOptions,
    ContextInterface,
} from '@togglecorp/toggle-request';
import { mapToMap } from '@togglecorp/fujs';

import {
    wsEndpoint,
} from '#base/configs/restRequest';

function getVersionedUrl(endpoint: string, url: string) {
    return `${endpoint}${url}`;
}

export interface Error {
    reason?: string;
    // exception: any;
    value?: {
        // FIXME: deprecate faramErrors as it doesn''t work with new form
        faramErrors: {
            [key: string]: string | undefined;
        },
        errors: ErrorFromServer['errors'] | undefined,
        messageForNotification: string,
    };
    errorCode: number | undefined;
}

export interface ErrorFromServer {
    errorCode?: number;
    errors: {
        // NOTE: it is most probably only string[]
        [key: string]: string[] | string;
    };
}

function alterResponse(errors: ErrorFromServer['errors']) {
    const otherErrors = mapToMap(
        errors,
        (item) => (item === 'nonFieldErrors' ? '$internal' : item),
        (item) => (Array.isArray(item) ? item.join(' ') : item),
    );
    return otherErrors;
}

export interface OptionBase {
    formData?: boolean;
    failureMessage?: React.ReactNode;
}

export type GatesContextInterface = ContextInterface<
    unknown,
    ErrorFromServer | undefined,
    Error,
    OptionBase
>;

const serverPrefix = 'server://';

export const processGatesUrls: GatesContextInterface['transformUrl'] = (url) => {
    if (url.startsWith(serverPrefix)) {
        // NOTE: -1 to leave out the starting slash
        const cleanedUrl = url.slice(serverPrefix.length - 1);
        return getVersionedUrl(wsEndpoint, cleanedUrl);
    }
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    // eslint-disable-next-line no-console
    console.error('Url should start with http/https or a defined scope', url);
    return url;
};

export const processGatesOptions: GatesContextInterface['transformOptions'] = (
    _,
    options,
    // requestOptions,
) => {
    const {
        body,
        headers,
        ...otherOptions
    } = options;

    const requestBody = body ? JSON.stringify(body) : undefined;

    const finalOptions: RequestInit & {
        headers: {
            'X-CSRFToken'?: string;
        },
    } = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            ...headers,
        },
        body: requestBody,
        ...otherOptions,
    };

    return finalOptions;
};

export const processGatesResponse: GatesContextInterface['transformResponse'] = async (
    res,
    /*
    url,
    options,
    ctx,
    */
) => {
    const resText = await res.text();
    if (resText.length > 0) {
        const json = JSON.parse(resText);
        /*
        const { schemaName } = ctx;
        if (schemaName && options.method !== 'DELETE') {
            try {
                schema.validate(json, schemaName);
            } catch (e) {
                console.error(url, options.method, json, e.message);
            }
        }
        */
        return json;
    }
    return undefined;
};

export const processGatesError = (): GatesContextInterface['transformError'] => (
    res,
    _,
    __,
    ___,
) => {
    let error: Error;
    if (res === 'network') {
        error = {
            reason: 'network',
            // exception: e,
            value: {
                messageForNotification: 'Network error',
                faramErrors: {
                    $internal: 'Network error',
                },
                errors: undefined,
            },
            errorCode: undefined,
        };
    } else if (res === 'parse') {
        error = {
            reason: 'parse',
            value: {
                messageForNotification: 'Response parse error',
                faramErrors: {
                    $internal: 'Response parse error',
                },
                errors: undefined,
            },
            errorCode: undefined,
        };
    } else if (res) {
        const faramErrors = alterResponse(res.errors);

        const messageForNotification = (
            faramErrors?.$internal
            ?? 'Some error occurred while performing this action.'
        );

        const requestError = {
            faramErrors,
            messageForNotification,
            errors: res.errors,
        };

        error = {
            reason: 'server',
            value: requestError,
            errorCode: res.errorCode,
        };
    } else {
        const requestError = {
            messageForNotification: 'Server error',
            faramErrors: {
                $internal: 'Server error',
            },
            errors: undefined,
        };

        error = {
            reason: 'server',
            value: requestError,
            errorCode: undefined,
        };
    }

    return error;
};

// eslint-disable-next-line max-len
const useLazyRequest: <R, C = null>(requestOptions: LazyRequestOptions<R, Error, C, OptionBase>) => {
    response: R | undefined;
    pending: boolean;
    error: Error | undefined;
    trigger: (ctx: C) => void;
    context: C | undefined,
} = useMyLazyRequest;

const useRequest: <R>(requestOptions: RequestOptions<R, Error, OptionBase>) => {
    response: R | undefined;
    pending: boolean;
    error: Error | undefined;
    retrigger: () => void;
} = useMyRequest;

export { RequestContext, useRequest, useLazyRequest };
