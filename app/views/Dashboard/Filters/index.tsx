import React, { useMemo } from 'react';
import { listToGroupList } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    SelectInput,
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
} from '#generated/types';

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

const OUTBREAKS = gql`
    query Outbreaks {
        outBreaks {
            active
            outbreak
            __typename
        }
    }
`;

const COUNTRY_LIST = gql`
    query CountryList{
        countries {
            iso3
            countryName
            region
        }
    }
`;

type Country = NonNullable<CountryListQuery['countries']>[number];
const countriesKeySelector = (d: Country) => d.iso3;
const countriesLabelSelector = (d: Country) => d.countryName ?? '';

const INDICATORS_FOR_COUNTRY = gql`
    query IndicatorsForCountry (
        $indicatorName: String,
        $iso3: String,
        $outbreak: String
    ) {
        filterOptions {
            indicators(
                indicatorName: $indicatorName,
                iso3: $iso3,
                outBreak: $outbreak,
            ) {
                indicatorDescription
                indicatorName
                outbreak
                subvariable
            }
        }
    }
`;

type Indicator = NonNullable<NonNullable<IndicatorsForCountryQuery['filterOptions']>['indicators']>[number];
const indicatorKeySelector = (d: Indicator) => d.indicatorName;
const indicatorLabelSelector = (d: Indicator) => d.indicatorDescription;

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
                indicatorName
                indicatorDescription
            }
        }
    }
`;

type GlobalIndicator = NonNullable<NonNullable<IndicatorsQuery['filterOptions']>['overviewIndicators']>[number];
const globalIndicatorKeySelector = (d: GlobalIndicator) => d.indicatorName;
const globalIndicatorLabelSelector = (d: GlobalIndicator) => d.indicatorDescription;

export interface FilterType {
    outbreak?: string;
    region?: string;
    indicator?: string;
    country?: string;
}

interface Props {
    value: FilterType | undefined;
    onChange: React.Dispatch<React.SetStateAction<FilterType| undefined>>;
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

    const handleInputChange = React.useCallback(
        (newValue: string | undefined, name: keyof FilterType) => {
            if (onChange) {
                onChange((oldValue) => ({
                    ...oldValue,
                    [name]: newValue,
                }));
            }
        },
        [onChange],
    );

    const {
        data: countryList,
        loading: countryListLoading,
    } = useQuery<CountryListQuery, CountryListQueryVariables>(
        COUNTRY_LIST,
    );

    const {
        data: emergencies,
        loading: emergenciesLoading,
    } = useQuery<OutbreaksQuery, OutbreaksQueryVariables>(
        OUTBREAKS,
    );
    const indicatorListForCountryVariables = useMemo(() => ({
        iso3: value?.country,
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

    const indicators = indicatorList?.filterOptions?.indicators;

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

    return (
        <div className={styles.filtersWrapper}>
            <div className={styles.filters}>
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
                {(activeTab !== 'combinedIndicators') && (
                    <SelectInput
                        name="indicator"
                        options={activeTab === 'country' ? indicators : globalIndicators}
                        placeholder="Indicator"
                        keySelector={activeTab === 'country'
                            ? indicatorKeySelector
                            : globalIndicatorKeySelector}
                        labelSelector={activeTab === 'country'
                            ? indicatorLabelSelector
                            : globalIndicatorLabelSelector}
                        value={value?.indicator}
                        onChange={handleInputChange}
                        variant="general"
                        disabled={activeTab === 'country' ? indicatorsLoading : globalIndicatorsLoading}
                    />
                )}
                {(activeTab !== 'overview') && (
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
