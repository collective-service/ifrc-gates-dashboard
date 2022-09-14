import React, { useMemo, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';

import {
    listToGroupList,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    SelectInput,
    Button,
} from '@the-deep/deep-ui';

import {
    CountryListQuery,
    CountryListQueryVariables,
    OutbreaksQuery,
    OutbreaksQueryVariables,
    IndicatorsQuery,
    IndicatorsQueryVariables,
    IndicatorsForCountryQuery,
    IndicatorsForCountryQueryVariables,
    SubvariablesQuery,
    SubvariablesQueryVariables,
} from '#generated/types';
import { getRegionForCountry } from '#utils/common';

import { TabTypes, COUNTRY_LIST } from '..';
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

const OUTBREAKS = gql`
    query Outbreaks {
        outBreaks {
            active
            outbreak
            __typename
        }
    }
`;

type Country = NonNullable<CountryListQuery['countries']>[number];
const countriesKeySelector = (d: Country) => d.iso3;
const countriesLabelSelector = (d: Country) => d.countryName ?? '';

const INDICATORS_FOR_COUNTRY = gql`
    query IndicatorsForCountry (
        $iso3: String!,
        $outbreak: String
    ) {
        filterOptions {
            countryIndicators(
                iso3: $iso3,
                outbreak: $outbreak,
            ) {
                indicatorDescription
                indicatorId
            }
        }
    }
`;

type Indicator = NonNullable<NonNullable<IndicatorsForCountryQuery['filterOptions']>['countryIndicators']>[number];
const indicatorKeySelector = (d: Indicator) => d.indicatorId ?? '';
const indicatorLabelSelector = (d: Indicator) => d.indicatorDescription ?? '';

const INDICATORS = gql`
    query Indicators(
        $outbreak: String,
        $region: String,
    ) {
        filterOptions {
            overviewIndicators(
                outBreak: $outbreak,
                region: $region
            ) {
                indicatorId
                indicatorDescription
            }
        }
    }
`;

type GlobalIndicator = NonNullable<NonNullable<IndicatorsQuery['filterOptions']>['overviewIndicators']>[number];
const globalIndicatorKeySelector = (d: GlobalIndicator) => d.indicatorId ?? '';
const globalIndicatorLabelSelector = (d: GlobalIndicator) => d.indicatorDescription ?? '';

const SUBVARIABLES = gql`
    query Subvariables(
        $iso3: String!,
        $indicatorId:String
    ) {
        filterOptions {
            subvariables(iso3: $iso3, indicatorId: $indicatorId)
        }
    }
`;

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
}

function Filters(props: Props) {
    const {
        activeTab,
        onChange,
        value,
        advancedFilterValues,
        setAdvancedFilterValues,
    } = props;

    const handleClear = useCallback(() => {
        onChange({
            country: value?.country ?? 'AFG',
        });
    }, [onChange, value?.country]);

    const {
        data: countryList,
        loading: countryListLoading,
    } = useQuery<CountryListQuery, CountryListQueryVariables>(
        COUNTRY_LIST,
    );
    const getRegionForCountry = useCallback((country: string | undefined) => (
        countryList?.countries?.find((c) => c.iso3 === country)?.region
    ), [countryList?.countries]);

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
                            region: getRegionForCountry(
                                newValue,
                            ) ?? undefined,
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
            countryList?.countries,
        ],
    );

    const {
        data: emergencies,
        loading: emergenciesLoading,
    } = useQuery<OutbreaksQuery, OutbreaksQueryVariables>(
        OUTBREAKS,
    );

    const indicatorListForCountryVariables = useMemo(() => ({
        // FIXME: Take the default country from an index
        iso3: value?.country ?? 'AFG',
        outbreak: value?.outbreak,
    }), [
        value?.country,
        value?.outbreak,
    ]);

    const {
        data: indicatorList,
        loading: indicatorsLoading,
    } = useQuery<IndicatorsForCountryQuery, IndicatorsForCountryQueryVariables>(
        INDICATORS_FOR_COUNTRY,
        {
            variables: indicatorListForCountryVariables,
        },
    );

    const indicators = indicatorList?.filterOptions?.countryIndicators;

    const indicatorVariables = useMemo(() => ({
        outbreak: value?.outbreak,
        region: value?.region,
    }), [
        value?.outbreak,
        value?.region,
    ]);

    const {
        data: globalIndicatorList,
        loading: globalIndicatorsLoading,
    } = useQuery<IndicatorsQuery, IndicatorsQueryVariables>(
        INDICATORS,
        {
            variables: indicatorVariables,
        },
    );

    const globalIndicators = globalIndicatorList?.filterOptions?.overviewIndicators;

    const subvariablesVariables = useMemo(() => ({
        iso3: value?.country ?? 'AFG',
        indicatorId: value?.indicator ?? undefined,
    }), [
        value?.country,
        value?.indicator,
    ]);

    const {
        data: subvariableList,
        loading: subvariablesLoading,
    } = useQuery<SubvariablesQuery, SubvariablesQueryVariables>(
        SUBVARIABLES,
        {
            variables: subvariablesVariables,
        },
    );

    const subvariables = useMemo(() => (
        subvariableList?.filterOptions?.subvariables.map((sub) => ({
            key: sub,
            label: sub,
        }))
    ), [subvariableList]);

    const countriesWithNull = countryList?.countries ?? [];
    const countries = countriesWithNull.filter((country) => !doesObjectHaveAnyEmptyValue(country));

    const outbreaks = emergencies?.outBreaks?.map((e) => ({
        key: e.outbreak,
        label: e.outbreak,
    }));

    const regionGroupedCountryList = listToGroupList(
        countryList?.countries,
        (country) => country.region ?? '__null',
    );

    const regionListUnsafe = regionGroupedCountryList ? Object.keys(regionGroupedCountryList) : [];

    const regionList = regionListUnsafe
        .filter((r) => r !== '__null')
        .map((r) => ({ key: r, title: r }));

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(value, [''])
    ), [value]);

    return (
        <div className={styles.filtersWrapper}>
            <div className={styles.filters}>
                <div className={styles.left}>
                    {(activeTab === 'country') && (
                        <SelectInput
                            name="country"
                            options={countries}
                            placeholder="Country"
                            keySelector={countriesKeySelector}
                            labelSelector={countriesLabelSelector}
                            value={value?.country}
                            onChange={handleInputChange}
                            disabled={countryListLoading}
                            variant="general"
                            // TODO: Make this clearable in combined indicators tab
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
                            disabled={countryListLoading}
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
                            disabled={countryListLoading}
                            variant="general"
                            grouped
                            groupKeySelector={(item) => item.region || 'Unnamed'}
                            groupLabelSelector={(item) => item.region || 'Unnamed'}
                            // TODO: Make this clearable in combined indicators tab
                            nonClearable
                        />
                    )}
                    {(activeTab === 'overview') && (
                        <SelectInput
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
                </div>
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
