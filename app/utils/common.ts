import {
    listToMap,
    isObject,
    isList,
    isDefined,
    compareStringSearch,
    caseInsensitiveSubmatch,
    isFalsyString,
    isNotDefined,
} from '@togglecorp/fujs';

import { CountriesAndOutbreaksQuery } from '#generated/types';

type CountryListType = NonNullable<CountriesAndOutbreaksQuery['countries']>[number];

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
        value ? Math.round((value * 1000)) / 10 : undefined
    );
}

export function getShortMonth(date: string, format?: '2-digit' | 'numeric') {
    return (
        new Date(date)
            .toLocaleString('default', { month: 'short', year: format ?? '2-digit' })
    );
}

export function normalFormatter() {
    return (
        new Intl.NumberFormat(
            'en', { notation: 'compact' },
        )
    );
}

export function normalCommaFormatter() {
    return (
        new Intl.NumberFormat(
            'en',
        )
    );
}

export function getRegionForCountry(country: string | undefined, list: CountryListType[]) {
    return list?.find((c) => c.iso3 === country)?.region;
}

export function rankedSearchOnList<T>(
    list: T[],
    searchString: string | undefined,
    labelSelector: (item: T) => string,
) {
    if (isFalsyString(searchString)) {
        return list;
    }

    return list
        .filter((option) => caseInsensitiveSubmatch(labelSelector(option), searchString))
        .sort((a, b) => compareStringSearch(
            labelSelector(a),
            labelSelector(b),
            searchString,
        ));
}

export type FormatType = 'thousand' | 'million' | 'raw' | 'percent';
export function formatNumber(
    format: FormatType,
    value: number | null | undefined,
    totalValue?: number,
) {
    if (isNotDefined(value) || value === null) {
        return 'N/A';
    }
    if (format === 'thousand') {
        return `${Math.round(value / 100) / 10}K`;
    }
    if (format === 'million') {
        return `${Math.round(value / 100000) / 10}M`;
    }
    if (format === 'percent') {
        if (isDefined(totalValue) && totalValue > 0) {
            return `${Math.round((value / totalValue) * 1000) / 10}%`;
        }
        return `${value ? decimalToPercentage(value) : 0}%`;
    }
    return `${normalCommaFormatter().format(Math.round(value * 10) / 10)}`;
}

export const negativeToZero = (
    (indicatorValue?: number | null, errorMarginValue?: number | null) => {
        const valueInd = isNotDefined(indicatorValue) ? 0 : indicatorValue;
        const valueErr = isNotDefined(errorMarginValue) ? 0 : errorMarginValue;
        const difference = (valueInd - valueErr) < 0 ? 0 : valueInd - valueErr;

        return decimalToPercentage(difference);
    }
);

export const positiveToZero = (
    (indicatorValue?: number | null, errorMarginValue?: number | null) => {
        const valueInd = isNotDefined(indicatorValue) ? 0 : indicatorValue;
        const valueErr = isNotDefined(errorMarginValue) ? 0 : errorMarginValue;
        const sum = (valueInd + valueErr) > 1 ? 1 : valueInd + valueErr;

        return decimalToPercentage(sum);
    }
);
