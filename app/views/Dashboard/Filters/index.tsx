import React from 'react';
import { listToGroupList } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    SelectInput,
} from '@the-deep/deep-ui';

import {
    CountryListQuery,
    CountryListQueryVariables,
} from '#generated/types';

import { TabTypes } from '..';
import AdvancedFilters, { AdvancedOptionType } from '../AdvancedFilters';
import styles from './styles.css';

interface Outbreak {
    key: 'Monkeypox' | 'COVID-19';
    label: string;
}

// FIXME: Data to be fetched from graphql
const outbreaks: Outbreak[] = [
    {
        key: 'Monkeypox',
        label: 'Monkeypox',
    },
    {
        key: 'COVID-19',
        label: 'COVID-19',
    },
];

const outbreakKeySelector = (d: Outbreak) => d.key;
const outbreakLabelSelector = (d: Outbreak) => d.label;

interface Region {
    key: string;
    title: string;
}

const regionsKeySelector = (d: Region) => d.key;
const regionsLabelSelector = (d: Region) => d.title;

interface Indicator {
    key: string;
    name: string;
}
const indicators: Indicator[] = [
    {
        key: '1',
        name: 'Percentage of individuals who receive information from the government',
    },
    {
        key: '2',
        name: 'Percentage of individuals who trust information they receive from the newspapers',
    },
    {
        key: '3',
        name: 'Percentage of individuals who seek information about prevention of the disease',
    },
];

const indicatorKeySelector = (d: Indicator) => d.key;
const indicatorLabelSelector = (d: Indicator) => d.name;

const COUNTRY_LIST_WITH_REGION = gql`
    query CountryListWithRegion {
        countryProfiles {
            iso3
            countryName
            region
        }
    }
`;

type Country = NonNullable<CountryListQuery['countryProfiles']>[number];
const countriesKeySelector = (d: Country) => d.iso3;
const countriesLabelSelector = (d: Country) => d.countryName ?? '';

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
        COUNTRY_LIST_WITH_REGION,
    );

    // const countryMap = countryList?.countryProfiles.map((c) => c.region);
    const regionGroupedCountryList = listToGroupList(
        countryList?.countryProfiles,
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
                    />
                )}
                {(activeTab !== 'combinedIndicators') && (
                    <SelectInput
                        name="indicator"
                        options={indicators}
                        placeholder="Indicator"
                        keySelector={indicatorKeySelector}
                        labelSelector={indicatorLabelSelector}
                        value={value?.indicator}
                        onChange={handleInputChange}
                        variant="general"
                    />
                )}
                {(activeTab !== 'overview') && (
                    <SelectInput
                        name="country"
                        options={countryList?.countryProfiles ?? []}
                        placeholder="Country"
                        keySelector={countriesKeySelector}
                        labelSelector={countriesLabelSelector}
                        value={value?.country}
                        onChange={handleInputChange}
                        disabled={countryListLoading}
                        variant="general"
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
