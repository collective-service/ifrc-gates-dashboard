import React, { useCallback, useMemo } from 'react';
import Select, { MultiValue } from 'react-select';

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

const ADVANCED_FILTER_OPTIONS = gql`
query AdvancedFilterOptions($thematic: String!, $type: String!) {
        filterOptions {
            types
            thematics(type: $type)
            topics(thematic: $thematic)
            keywords
        }
    }
`;

interface FilterType {
    key: string;
    label: string;
}

const filterTypeKeySelector = (d: FilterType) => d.key;
const filterTypeLabelSelector = (d: FilterType) => d.label;

interface Thematic {
    key: string;
    label: string;
}

const thematicKeySelector = (d: Thematic) => d.key;
const thematicLabelSelector = (d: Thematic) => d.label;

interface Topic {
    key: string;
    label: string;
}

const topicKeySelector = (d: Topic) => d.key;
const topicLabelSelector = (d: Topic) => d.label;

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

    const types = useMemo(() => (
        advancedFilterOptions?.filterOptions?.types.map((t) => ({
            key: t,
            label: t,
        }))
    ), [advancedFilterOptions?.filterOptions?.types]);

    const thematics = useMemo(() => (
        advancedFilterOptions?.filterOptions?.thematics.map((t) => ({
            key: t,
            label: t,
        }))
    ), [advancedFilterOptions?.filterOptions?.thematics]);

    const topics = useMemo(() => (
        advancedFilterOptions?.filterOptions?.topics.map((t) => ({
            key: t,
            label: t,
        }))
    ), [advancedFilterOptions?.filterOptions?.topics]);

    const keywords = useMemo(() => (
        advancedFilterOptions?.filterOptions?.keywords?.map((keyword) => ({
            value: keyword,
            label: keyword,
        }))
    ), [advancedFilterOptions?.filterOptions?.keywords]);

    const handleInputChange = useCallback(
        (newValue: string | string[] | undefined, name: keyof AdvancedOptionType) => {
            if (onChange) {
                if (name === 'type') {
                    onChange((oldValue) => ({
                        type: newValue as string,
                        thematic: undefined,
                        topic: undefined,
                        keywords: oldValue?.keywords,
                    }));
                } else if (name === 'thematic') {
                    onChange((oldValue) => ({
                        // FIXME: Get type of the selected thematic
                        type: oldValue?.type,
                        thematic: newValue as string,
                        topic: undefined,
                        keywords: oldValue?.keywords,
                    }));
                } else if (name === 'topic') {
                    onChange((oldValue) => ({
                        type: oldValue?.type,
                        thematic: oldValue?.thematic,
                        topic: newValue as string,
                        keywords: oldValue?.keywords,
                    }));
                } else if (name === 'keywords') {
                    onChange((oldValue) => ({
                        ...oldValue,
                        keywords: newValue as string[],
                    }));
                } else {
                    onChange((oldValue) => ({
                        ...oldValue,
                        [name]: newValue as string,
                    }));
                }
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

    const keywordValue = useMemo(() => (
        value?.keywords?.map((keyword) => ({
            value: keyword,
            label: keyword,
        }))
    ), [value?.keywords]);

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
                classNamePrefix="react-select"
                isMulti
                onChange={handleSelectChange}
                options={keywords}
                value={keywordValue}
                placeholder="Keywords"
            />
        </div>
    );
}

export default AdvancedFilters;
