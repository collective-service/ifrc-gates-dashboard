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
    return isDefined(value)
        ? Math.round((value * 1000)) / 10
        : undefined;
}

export function getShortMonth(date: string, format?: '2-digit' | 'numeric') {
    return (
        new Date(date).toLocaleString(
            'default',
            { month: 'short', year: format ?? '2-digit' },
        )
    );
}

export function normalFormatter() {
    return new Intl.NumberFormat('en', { notation: 'compact' });
}

export function normalCommaFormatter() {
    return (
        new Intl.NumberFormat(
            'en',
        )
    );
}

// FIXME: remove this util
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

function defaultFormatter(value: number, abbreviate: boolean) {
    if (Math.abs(value) < 1 && value !== 0) {
        return abbreviate ? '<1' : String(value);
    }
    return String(Math.round(value * 10) / 10);
}

function rawFormatter(value: number, abbreviate: boolean) {
    if (Math.abs(value) < 1 && value !== 0) {
        return abbreviate ? '<1' : String(value);
    }
    const roundedValue = Math.round(value * 10) / 10;
    return normalCommaFormatter().format(roundedValue);
}

function formatRawNumber(
    value: number | null | undefined,
    formatter: ((value: number, abbreviate: boolean) => string) | undefined = defaultFormatter,
    abbreviate: boolean,
) {
    if (isNotDefined(value)) {
        return undefined;
    }
    return formatter(value, abbreviate);
}

export type FormatType = 'thousand' | 'million' | 'raw' | 'percent';
export function formatNumber(
    format: FormatType,
    value: number | null | undefined,
    abbreviate = true,
): string | undefined {
    if (isNotDefined(value) || value === null) {
        return undefined;
    }
    if (format === 'thousand') {
        const normalValue = formatRawNumber(
            value / 1000,
            undefined,
            abbreviate,
        );
        return `${normalValue}K`;
    }
    if (format === 'million') {
        const normalValue = formatRawNumber(
            value / 1000000,
            undefined,
            abbreviate,
        );
        return `${normalValue}M`;
    }
    if (format === 'percent') {
        const percent = formatRawNumber(
            value * 100,
            undefined,
            abbreviate,
        );
        return `${percent}%`;
    }
    const normalValue = formatRawNumber(
        value,
        rawFormatter,
        abbreviate,
    );
    return normalValue;
}

// FIXME: remove this and use fujs.bound instead
export const negativeToZero = (
    indicatorValue: number | null | undefined,
    errorMarginValue: number | null | undefined,
) => {
    const valueInd = isNotDefined(indicatorValue) ? 0 : indicatorValue;
    const valueErr = isNotDefined(errorMarginValue) ? 0 : errorMarginValue;
    // FIXME: just use bounds
    const difference = (valueInd - valueErr) < 0 ? 0 : valueInd - valueErr;

    return decimalToPercentage(difference);
};

// FIXME: remove this and use fujs.bound instead
export const positiveToZero = (
    indicatorValue: number | null | undefined,
    errorMarginValue: number | null | undefined,
) => {
    const valueInd = isNotDefined(indicatorValue) ? 0 : indicatorValue;
    const valueErr = isNotDefined(errorMarginValue) ? 0 : errorMarginValue;

    // FIXME: just use bounds
    const sum = (valueInd + valueErr) > 1 ? 1 : valueInd + valueErr;

    return decimalToPercentage(sum);
};

export const colors: Record<string, string> = {
    'COVID-19': '#FFDD98',
    Monkeypox: '#ACA28E',
    Cholera: '#C09A57',
    'Spanish Flu': '#C7BCA9',
    Ebola: '#CCB387',
};

export type Maybe<T> = T | undefined | null;

export function max<T>(
    list: Maybe<T[]>,
    getNumericValue: (val: T) => number | null | undefined,
): T | undefined {
    if (!list || list.length <= 0) {
        return undefined;
    }

    interface Acc {
        maxItem: T | undefined,
        maxValue: number | undefined | null,
    }

    const values = list.reduce(
        (acc: Acc, item: T) => {
            const { maxValue } = acc;
            const myValue = getNumericValue(item);
            return isDefined(myValue) && (isNotDefined(maxValue) || myValue > maxValue)
                ? { maxValue: myValue, maxItem: item }
                : acc;
        },
        {
            maxItem: undefined,
            maxValue: undefined,
        },
    );
    return values.maxItem;
}

export function min<T>(
    list: Maybe<T[]>,
    getNumericValue: (val: T) => number | null | undefined,
): T | undefined {
    if (!list || list.length <= 0) {
        return undefined;
    }

    interface Acc {
        minItem: T | undefined,
        minValue: number | undefined | null,
    }

    const values = list.reduce(
        (acc: Acc, item: T) => {
            const { minValue } = acc;
            const myValue = getNumericValue(item);
            return isDefined(myValue) && (isNotDefined(minValue) || myValue < minValue)
                ? { minValue: myValue, minItem: item }
                : acc;
        },
        {
            minItem: undefined,
            minValue: undefined,
        },
    );

    return values.minItem;
}
