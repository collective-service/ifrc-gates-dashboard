import React, { useMemo, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';

import {
    listToGroupList,
    doesObjectHaveNoData,
    compareString,
} from '@togglecorp/fujs';
import {
    SelectInput,
    Button,
} from '@the-deep/deep-ui';

import {
    IndicatorsQuery,
    IndicatorsForCountryQuery,
    SubvariablesQuery,
    CountriesAndOutbreaksQuery,
} from '#generated/types';
import { getRegionForCountry } from '#utils/common';

import { TabTypes } from '..';
import AdvancedFilters, { AdvancedOptionType } from '../AdvancedFilters';
import styles from './styles.css';

interface Outbreak {
    key: string;
    label: string;
}

const outbreakKeySelector = (d: Outbreak) => d.key;
const outbreakLabelSelector = (d: Outbreak) => d.label;

interface Region {
    key: string;
    title: string;
}

const regionsKeySelector = (d: Region) => d.key;
const regionsLabelSelector = (d: Region) => d.title;

function doesObjectHaveAnyEmptyValue<T extends Record<string, unknown>>(obj: T) {
    const valueList = Object.values(obj);
    return valueList.some((val) => val === null);
}

type Country = NonNullable<CountriesAndOutbreaksQuery['countries']>[number];
const countriesKeySelector = (d: Country) => d.iso3;
const countriesLabelSelector = (d: Country) => d.countryName ?? '';

type Indicator = NonNullable<NonNullable<IndicatorsForCountryQuery['filterOptions']>['countryIndicators']>[number];
const indicatorKeySelector = (d: Indicator) => d.indicatorId ?? '';
const indicatorLabelSelector = (d: Indicator) => d.indicatorDescription ?? '';

type GlobalIndicator = NonNullable<NonNullable<IndicatorsQuery['filterOptions']>['overviewIndicators']>[number];
const globalIndicatorKeySelector = (d: GlobalIndicator) => d.indicatorId ?? '';
const globalIndicatorLabelSelector = (d: GlobalIndicator) => d.indicatorDescription ?? '';

interface Subvariable {
    key: string;
    label: string;
}
const subvariableKeySelector = (d: Subvariable) => d.key;
const subvariableLabelSelector = (d: Subvariable) => d.label;

export interface FilterType {
    outbreak?: string;
    region?: string;
    indicator?: string;
    country?: string;
    subvariable?: string;
}

interface Props {
    value: FilterType | undefined;
    onChange: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    activeTab?: TabTypes;
    advancedFilterValues: AdvancedOptionType | undefined;
    setAdvancedFilterValues: React.Dispatch<React.SetStateAction<AdvancedOptionType | undefined>>;
    countries?: NonNullable<CountriesAndOutbreaksQuery['countries']>;
    countriesLoading?: boolean;
    emergencies: NonNullable<CountriesAndOutbreaksQuery['outBreaks']>| undefined;
    indicatorList: IndicatorsForCountryQuery | undefined;
    globalIndicatorList: IndicatorsQuery | undefined;
    subvariableList: SubvariablesQuery | undefined;
    emergenciesLoading: boolean | undefined;
    subvariablesLoading: boolean | undefined;
    globalIndicatorsLoading: boolean | undefined;
    indicatorsLoading: boolean | undefined;
}

function Filters(props: Props) {
    const {
        activeTab,
        onChange,
        countriesLoading,
        value,
        advancedFilterValues,
        countries: countriesFromProps,
        setAdvancedFilterValues,
        emergencies,
        indicatorList,
        globalIndicatorList,
        subvariableList,
        emergenciesLoading,
        subvariablesLoading,
        globalIndicatorsLoading,
        indicatorsLoading,
    } = props;

    const handleClear = useCallback(() => {
        if (activeTab === 'country') {
            onChange({
                country: value?.country ?? 'AFG',
            });
        } else {
            onChange({});
        }
    }, [onChange, value?.country, activeTab]);

    const handleInputChange = useCallback(
        (newValue: string | undefined, name: keyof FilterType) => {
            if (onChange) {
                if (name === 'region') {
                    onChange((oldValue) => ({
                        ...oldValue,
                        [name]: newValue,
                        country: undefined,
                        indicator: undefined,
                    }));
                } else if (name === 'country') {
                    onChange((oldValue) => {
                        const newValueForRegion = {
                            ...oldValue,
                            [name]: newValue,
                            region: newValue ? (
                                getRegionForCountry(
                                    newValue,
                                    countriesFromProps ?? [],
                                ) ?? undefined
                            ) : oldValue?.region,
                        };
                        return newValueForRegion;
                    });
                } else if (name === 'indicator') {
                    onChange((oldValue) => ({
                        ...oldValue,
                        outbreak: oldValue?.outbreak ?? 'COVID-19',
                        indicator: newValue,
                        // FIXME: Add a handler to select a default subvariable on indicator change
                    }));
                } else if (name === 'outbreak') {
                    onChange((oldValue) => ({
                        ...oldValue,
                        outbreak: newValue,
                        indicator: undefined,
                    }));
                } else {
                    onChange((oldValue) => ({
                        ...oldValue,
                        [name]: newValue,
                    }));
                }
            }
        },
        [
            onChange,
            countriesFromProps,
        ],
    );

    const indicators = indicatorList?.filterOptions?.countryIndicators;
    const globalIndicators = globalIndicatorList?.filterOptions?.overviewIndicators;

    const subvariables = useMemo(() => (
        subvariableList?.filterOptions?.subvariables.map((sub) => ({
            key: sub,
            label: sub,
        }))
    ), [subvariableList]);

    const countriesWithNull = countriesFromProps ?? [];
    const countries = countriesWithNull.filter((country) => !doesObjectHaveAnyEmptyValue(country));

    const outbreaks = emergencies?.map((e) => ({
        key: e.outbreak,
        label: e.outbreak,
    }));

    const regionGroupedCountryList = listToGroupList(
        countriesFromProps,
        (country) => country.region ?? '__null',
    );

    const regionListUnsafe = regionGroupedCountryList ? Object.keys(regionGroupedCountryList) : [];

    const regionList = regionListUnsafe
        .filter((r) => r !== '__null')
        .map((r) => ({ key: r, title: r }))
        .sort((a, b) => compareString(a.key, b.key));

    const isFilterEmpty = useMemo(() => {
        if (activeTab === 'country') {
            return doesObjectHaveNoData(value, [value?.country]);
        }
        return doesObjectHaveNoData(value, ['']);
    }, [value, activeTab]);

    return (
        <div className={styles.filtersWrapper}>
            <div className={styles.filters}>
                {(activeTab === 'country') && (
                    <SelectInput
                        name="country"
                        options={countries}
                        placeholder="Country"
                        keySelector={countriesKeySelector}
                        labelSelector={countriesLabelSelector}
                        value={value?.country}
                        onChange={handleInputChange}
                        disabled={countriesLoading}
                        variant="general"
                        nonClearable
                    />
                )}
                <SelectInput
                    name="outbreak"
                    options={outbreaks}
                    placeholder="Outbreak"
                    keySelector={outbreakKeySelector}
                    labelSelector={outbreakLabelSelector}
                    value={value?.outbreak}
                    onChange={handleInputChange}
                    variant="general"
                    disabled={emergenciesLoading}
                />
                {(activeTab !== 'country') && (
                    <SelectInput
                        name="region"
                        options={regionList}
                        placeholder="Region"
                        keySelector={regionsKeySelector}
                        labelSelector={regionsLabelSelector}
                        value={value?.region}
                        onChange={handleInputChange}
                        variant="general"
                        disabled={countriesLoading}
                    />
                )}
                {(activeTab === 'combinedIndicators') && (
                    <SelectInput
                        name="country"
                        options={countries}
                        placeholder="Country"
                        keySelector={countriesKeySelector}
                        labelSelector={countriesLabelSelector}
                        value={value?.country}
                        onChange={handleInputChange}
                        disabled={countriesLoading}
                        variant="general"
                        grouped
                        groupKeySelector={(item) => item.region || 'Unnamed'}
                        groupLabelSelector={(item) => item.region || 'Unnamed'}
                    />
                )}
                {(activeTab === 'overview') && (
                    <SelectInput
                        className={styles.indicatorSelectInput}
                        name="indicator"
                        options={globalIndicators}
                        placeholder="Indicator"
                        keySelector={globalIndicatorKeySelector}
                        labelSelector={globalIndicatorLabelSelector}
                        value={value?.indicator}
                        onChange={handleInputChange}
                        variant="general"
                        disabled={globalIndicatorsLoading}
                    />
                )}
                {(activeTab === 'country') && (
                    <SelectInput
                        className={styles.indicatorSelectInput}
                        name="indicator"
                        options={indicators}
                        placeholder="Indicator"
                        keySelector={indicatorKeySelector}
                        labelSelector={indicatorLabelSelector}
                        value={value?.indicator}
                        onChange={handleInputChange}
                        variant="general"
                        disabled={indicatorsLoading}
                    />
                )}
                {(activeTab === 'country' && value?.indicator) && (
                    <SelectInput
                        name="subvariable"
                        options={subvariables}
                        placeholder="Sub-indicator"
                        keySelector={subvariableKeySelector}
                        labelSelector={subvariableLabelSelector}
                        value={value?.subvariable}
                        onChange={handleInputChange}
                        variant="general"
                        disabled={subvariablesLoading}
                    />
                )}
                <Button
                    name={undefined}
                    variant="transparent"
                    icons={<IoClose />}
                    onClick={handleClear}
                    className={styles.clearButton}
                    disabled={isFilterEmpty}
                >
                    Clear all
                </Button>
            </div>
            {activeTab === 'combinedIndicators' && (
                <AdvancedFilters
                    value={advancedFilterValues}
                    onChange={setAdvancedFilterValues}
                />
            )}
        </div>
    );
}

export default Filters;
