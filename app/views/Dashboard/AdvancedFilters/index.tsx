import React, { useCallback, useMemo } from 'react';
import Select, { MultiValue } from 'react-select';

import { listToMap } from '@togglecorp/fujs';
import {
    RadioInput,
    SelectInput,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import {
    AdvancedFilterOptionsQuery,
    AdvancedFilterOptionsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

export interface AdvancedOptionType {
    type?: string;
    thematic?: string;
    topic?: string;
    keywords?: string[];
}

interface Thematic {
    key: string;
    label: string;
}

const thematicKeySelector = (d: Thematic) => d.key;
const thematicLabelSelector = (d: Thematic) => d.label;

const ADVANCED_FILTER_OPTIONS = gql`
query AdvancedFilterOptions($thematic: String!, $type: String!) {
        filterOptions {
            types
            thematics(type: $type)
            topics(thematic: $thematic)
        }
    }
`;

interface FilterType {
    key: string;
    label: string;
}

const filterTypeKeySelector = (d: FilterType) => d.key;
const filterTypeLabelSelector = (d: FilterType) => d.label;

interface Topic {
    key: string;
    label: string;
}

const topicKeySelector = (d: Topic) => d.key;
const topicLabelSelector = (d: Topic) => d.label;

interface Keyword {
    key: string;
    label: string;
}

const keywords: Keyword[] = [
    {
        key: '1',
        label: 'Communication',
    },
    {
        key: '2',
        label: 'Information',
    },
    {
        key: '3',
        label: 'Vaccination',
    },
    {
        key: '4',
        label: 'Recovery',
    },
];

interface LabelValue {
    label: string;
    value: string;
}

interface Props {
    value: AdvancedOptionType | undefined;
    onChange: React.Dispatch<React.SetStateAction<AdvancedOptionType | undefined>>;
}

function AdvancedFilters(props: Props) {
    const {
        value,
        onChange,
    } = props;

    const handleInputChange = useCallback(
        (newValue: string | string[] | undefined, name: keyof AdvancedOptionType) => {
            if (onChange) {
                onChange((oldValue) => ({
                    ...oldValue,
                    [name]: newValue,
                }));
            }
        },
        [onChange],
    );

    const handleSelectChange = useCallback(
        (newValue: MultiValue<LabelValue>) => {
            const newValueList = newValue?.map((v) => v.value);
            handleInputChange(newValueList, 'keywords');
        },
        [handleInputChange],
    );

    const filterOptionsVariables = useMemo(() => ({
        type: value?.type ?? '',
        thematic: value?.thematic ?? '',
    }), [value?.type, value?.thematic]);

    const {
        data: advancedFilterOptions,
        loading: advancedFiltersLoading,
    } = useQuery<AdvancedFilterOptionsQuery, AdvancedFilterOptionsQueryVariables>(
        ADVANCED_FILTER_OPTIONS,
        {
            variables: filterOptionsVariables,
        },
    );

    const types = advancedFilterOptions?.filterOptions?.types.map((t) => ({
        key: t,
        label: t,
    }));

    const thematics = advancedFilterOptions?.filterOptions?.thematics.map((t) => ({
        key: t,
        label: t,
    }));

    const topics = advancedFilterOptions?.filterOptions?.topics.map((t) => ({
        key: t,
        label: t,
    }));

    const keywordOptionsMap = useMemo(
        () => listToMap(keywords, (d) => d.key, (d) => d),
        [],
    );

    const keywordOptions = useMemo(() => keywords.map((keyword) => ({
        value: keyword.key,
        label: keyword.label,
    })), []);

    const keywordValue = React.useMemo(() => (
        value?.keywords?.map(
            (keyword) => ({
                label: keywordOptionsMap[keyword].label,
                value: keywordOptionsMap[keyword].key,
            }),
        )
    ), [value?.keywords, keywordOptionsMap]);

    return (
        <div className={styles.advancedFilters}>
            <RadioInput
                name="type"
                className={styles.filter}
                keySelector={filterTypeKeySelector}
                label="Type"
                labelSelector={filterTypeLabelSelector}
                options={types}
                value={value?.type}
                onChange={handleInputChange}
                disabled={advancedFiltersLoading}
            />
            <SelectInput
                name="thematic"
                className={styles.filter}
                options={thematics}
                placeholder="Thematic"
                keySelector={thematicKeySelector}
                labelSelector={thematicLabelSelector}
                value={value?.thematic}
                onChange={handleInputChange}
                variant="general"
                disabled={advancedFiltersLoading}
            />
            <SelectInput
                name="topic"
                className={styles.filter}
                options={topics}
                placeholder="Topic"
                keySelector={topicKeySelector}
                labelSelector={topicLabelSelector}
                value={value?.topic}
                onChange={handleInputChange}
                variant="general"
                disabled={advancedFiltersLoading}
            />
            <Select
                className={styles.keywords}
                isMulti
                onChange={handleSelectChange}
                options={keywordOptions}
                value={keywordValue}
            />
        </div>
    );
}

export default AdvancedFilters;
