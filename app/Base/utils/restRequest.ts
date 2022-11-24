import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { apiEndpoint } from '#base/configs/env';

export const wsEndpoint = apiEndpoint ?? 'http://localhost:7020/api/v1';

type Maybe<T> = T | null | undefined;

export interface UrlParams {
    [key: string]: Maybe<string | number | boolean | (string | number | boolean)[]>;
}

export function prepareUrlParams(params: UrlParams): string {
    return Object.keys(params)
        .filter((k) => isDefined(params[k]))
        .map((k) => {
            const param = params[k];
            if (isNotDefined(param)) {
                return undefined;
            }
            let val: string;
            if (Array.isArray(param)) {
                val = param.join(',');
            } else if (typeof param === 'number' || typeof param === 'boolean') {
                val = String(param);
            } else {
                val = param;
            }
            return `${encodeURIComponent(k)}=${encodeURIComponent(val)}`;
        })
        .filter(isDefined)
        .join('&');
}

const serverPrefix = 'server://';

export const prepareUrl = (url: string) => {
    if (url.startsWith(serverPrefix)) {
        // NOTE: -1 to leave out the starting slash
        const cleanedUrl = url.slice(serverPrefix.length - 1);
        return `${wsEndpoint}${cleanedUrl}`;
    }
    if (/^https?:\/\//i.test(url)) {
        return url;
    }
    // eslint-disable-next-line no-console
    console.error('Url should start with http/https or a defined scope', url);
    return url;
};
