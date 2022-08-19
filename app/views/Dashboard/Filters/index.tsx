import React from 'react';

import {
    SelectInput,
} from '@the-deep/deep-ui';

import { TabTypes } from '..';
import AdvancedFilters, { AdvancedOptionType } from '../AdvancedFilters';
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
    advancedOptions: AdvancedOptionType | undefined;
    setAdvancedOptions: React.Dispatch<React.SetStateAction<AdvancedOptionType | undefined>>;
}

function Filters(props: Props) {
    const {
        activeTab,
        onChange,
        value,
        advancedOptions,
        setAdvancedOptions,
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
                />
                {(activeTab !== 'country') && (
                    <SelectInput
                        name="region"
                        options={regions}
                        placeholder="Regions"
                        keySelector={regionsKeySelector}
                        labelSelector={regionsLabelSelector}
                        value={value?.region}
                        onChange={handleInputChange}
                    />
                )}
                {(activeTab !== 'combinedIndicators') && (
                    <SelectInput
                        name="indicator"
                        options={indicators}
                        placeholder="Indicators"
                        keySelector={indicatorKeySelector}
                        labelSelector={indicatorLabelSelector}
                        value={value?.indicator}
                        onChange={handleInputChange}
                    />
                )}
                {(activeTab !== 'overview') && (
                    <SelectInput
                        name="country"
                        options={countries}
                        placeholder="Countries"
                        keySelector={countriesKeySelector}
                        labelSelector={countriesLabelSelector}
                        value={value?.country}
                        onChange={handleInputChange}
                    />
                )}
            </div>
            {activeTab === 'combinedIndicators' && (
                <AdvancedFilters
                    value={advancedOptions}
                    onChange={setAdvancedOptions}
                />
            )}
        </div>
    );
}

export default Filters;
