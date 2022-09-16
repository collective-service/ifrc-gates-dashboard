import {
    listToMap,
    isObject,
    isList,
    isDefined,
} from '@togglecorp/fujs';

const standaloneMode = (window as { standaloneMode?: boolean }).standaloneMode ?? false;

export function getDashboardLink() {
    // NOTE: we need to also add countryName on standaloneMode url
    return standaloneMode
        ? '/?page=dashboard'
        : '/dashboard';
}

export function parseQueryString(value: string) {
    const val = value.substring(1);
    return listToMap(
        val.split('&').map((token) => token.split('=')),
        (item) => item[0],
        (item) => item[1],
    );
}

export type PurgeNull<T> = (
    T extends (infer Z)[]
    ? PurgeNull<Z>[]
    : (
        // eslint-disable-next-line @typescript-eslint/ban-types
        T extends object
        ? { [K in keyof T]: PurgeNull<T[K]> }
        : (T extends null ? undefined : T)
    )
)

export function removeNull<T>(
    data: T | undefined | null,
    ignoreKeys: string[] | null | undefined = ['__typename'],
): PurgeNull<T> | undefined {
    if (data === null || data === undefined) {
        return undefined;
    }

    if (isList(data)) {
        return (data
            .map((item) => removeNull(item, ignoreKeys))
            .filter(isDefined) as PurgeNull<T>);
    }

    if (isObject(data)) {
        let newData = {};
        (Object.keys(data) as unknown as (keyof typeof data)[]).forEach((k) => {
            const key = k;
            if (ignoreKeys && ignoreKeys.includes(key as string)) {
                return;
            }

            const val = data[key];
            const newEntry = removeNull(val, ignoreKeys);
            if (isDefined(newEntry)) {
                newData = {
                    ...newData,
                    [key]: newEntry,
                };
            }
        });

        return newData as PurgeNull<T>;
    }

    return data as PurgeNull<T>;
}

export function decimalToPercentage(value: number | null | undefined) {
    return (
        value ? (value * 100).toFixed(2) : undefined
    );
}

export function getShortMonth(date: string) {
    return (
        new Date(date)
            .toLocaleString('default', { month: 'short', year: '2-digit' })
    );
}
