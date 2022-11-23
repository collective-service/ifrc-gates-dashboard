import React, { useCallback, useMemo } from 'react';

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
}

interface Thematic {
    key: string;
    label: string;
}

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
        previousData: prevData,
        data: advancedFilterOptions = prevData,
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

    // FIXME: any reason not to have 3 different handlers?
    const handleInputChange = useCallback(
        (newValue: string | string[] | undefined, name: keyof AdvancedOptionType) => {
            if (onChange) {
                if (name === 'type') {
                    onChange(() => ({
                        type: newValue as string,
                        thematic: undefined,
                        topic: undefined,
                    }));
                } else if (name === 'thematic') {
                    onChange((oldValue) => ({
                        // FIXME: Get type of the selected thematic
                        type: oldValue?.type,
                        thematic: newValue as string,
                        topic: undefined,
                    }));
                } else if (name === 'topic') {
                    onChange((oldValue) => ({
                        type: oldValue?.type,
                        thematic: oldValue?.thematic,
                        topic: newValue as string,
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
        </div>
    );
}

export default AdvancedFilters;
