import React, { useState } from 'react';

import {
    SelectInput,
} from '@the-deep/deep-ui';

import { TabTypes } from '..';
import AdvancedFilters from '../AdvancedFilters';
import styles from './styles.css';

interface Outbreak {
    key: string;
    name: string;
}
const outbreaks: Outbreak[] = [
    {
        key: '1',
        name: 'Monkey Pox',
    },
    {
        key: '2',
        name: 'Ebola',
    },
    {
        key: '3',
        name: 'Covid',
    },
];

const outbreakKeySelector = (d: Outbreak) => d.key;
const outbreakLabelSelector = (d: Outbreak) => d.name;

interface Region {
    key: string;
    title: string;
}
const regions: Region[] = [
    {
        key: '1',
        title: 'Americas',
    },
    {
        key: '2',
        title: 'Asia/Pacific',
    },
    {
        key: '3',
        title: 'ESAR',
    },
    {
        key: '4',
        title: 'Europe',
    },
    {
        key: '5',
        title: 'MENA',
    },
    {
        key: '6',
        title: 'WCAR',
    },
];

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

interface Country {
    key: string;
    name: string;
}

const countries: Country[] = [
    {
        key: 'AFG',
        name: 'Afghanistan',
    },
    {
        key: 'IND',
        name: 'India',
    },
    {
        key: 'NPL',
        name: 'Nepal',
    },
    {
        key: 'CHI',
        name: 'China',
    },
];

const countriesKeySelector = (d: Country) => d.key;
const countriesLabelSelector = (d: Country) => d.name;

interface Props {
    activeTab?: TabTypes;
}

function Filters(props: Props) {
    const {
        activeTab,
    } = props;

    const [
        selectedOutbreak,
        setSelectedOutbreak,
    ] = useState<string | undefined>();

    const [
        selectedRegion,
        setSelectedRegion,
    ] = useState<string | undefined>();

    const [
        selectedIndicator,
        setSelectedIndicator,
    ] = useState<string | undefined>();

    const [
        selectedCountry,
        setSelectedCountry,
    ] = useState<string | undefined>();

    return (
        <div className={styles.filtersWrapper}>
            <div className={styles.filters}>
                <SelectInput
                    name="outbreak"
                    options={outbreaks}
                    placeholder="Outbreak"
                    keySelector={outbreakKeySelector}
                    labelSelector={outbreakLabelSelector}
                    value={selectedOutbreak}
                    onChange={setSelectedOutbreak}
                />
                <SelectInput
                    name="regions"
                    options={regions}
                    placeholder="Regions"
                    keySelector={regionsKeySelector}
                    labelSelector={regionsLabelSelector}
                    value={selectedRegion}
                    onChange={setSelectedRegion}
                />
                <SelectInput
                    name="indicators"
                    options={indicators}
                    placeholder="Indicators"
                    keySelector={indicatorKeySelector}
                    labelSelector={indicatorLabelSelector}
                    value={selectedIndicator}
                    onChange={setSelectedIndicator}
                />
                {activeTab === 'country' && (
                    <SelectInput
                        name="countries"
                        options={countries}
                        placeholder="Countries"
                        keySelector={countriesKeySelector}
                        labelSelector={countriesLabelSelector}
                        value={selectedCountry}
                        onChange={setSelectedCountry}
                    />
                )}
            </div>
            {activeTab === 'combinedIndicators' && (
                <AdvancedFilters />
            )}
        </div>
    );
}

export default Filters;
