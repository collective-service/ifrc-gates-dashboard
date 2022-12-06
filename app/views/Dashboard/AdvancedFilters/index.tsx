import React, { useCallback, useMemo, useState } from 'react';
import {
    isDefined,
    unique,
    _cs,
} from '@togglecorp/fujs';
import {
    RadioInput,
    SelectInput,
    SearchMultiSelectInput,
    Button,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import {
    AdvancedFilterOptionsQuery,
    AdvancedFilterOptionsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

export type ThematicsOption = NonNullable<NonNullable<AdvancedFilterOptionsQuery['filterOptions']>['thematics']>[number];
export type TopicsOption = NonNullable<NonNullable<AdvancedFilterOptionsQuery['filterOptions']>['topics']>[number];

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

    const [
        thematicOptions,
        setThematicOptions,
    ] = useState<ThematicsOption[] | null | undefined>([]);

    const [
        topicOptions,
        setTopicOptions,
    ] = useState<TopicsOption[] | null | undefined>([]);

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
            onCompleted: (response) => {
                const { filterOptions } = response;

                const thematicOptionsFromFilters: ThematicsOption[] = [];
                const topicOptionsFromFilters: TopicsOption[] = [];

                thematicOptionsFromFilters.push(
                    ...(filterOptions?.thematics
                        ?.filter(isDefined) ?? []),
                );

                topicOptionsFromFilters.push(
                    ...(filterOptions?.topics
                        ?.filter(isDefined) ?? []),
                );

                const uniqueThematics = unique(
                    thematicOptionsFromFilters,
                    (o) => o,
                );
                const uniqueTopics = unique(
                    topicOptionsFromFilters,
                    (o) => o,
                );

                setThematicOptions(uniqueThematics);
                setTopicOptions(uniqueTopics);
            },
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
        <div className={styles.thematicFilterSection}>
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
                {/* <SelectInput
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
                /> */}
                <SearchMultiSelectInput
                    name="thematic"
                    className={styles.filter}
                    options={thematics}
                    placeholder="Thematic"
                    keySelector={thematicKeySelector}
                    labelSelector={thematicLabelSelector}
                    value={thematicOptions}
                    onChange={handleInputChange}
                    variant="general"
                    disabled={advancedFiltersLoading}
                />
                <SearchMultiSelectInput
                    name="topic"
                    className={styles.filter}
                    options={topics}
                    placeholder="Topic"
                    keySelector={topicKeySelector}
                    labelSelector={topicLabelSelector}
                    value={topicOptions}
                    onChange={handleInputChange}
                    variant="general"
                    disabled={advancedFiltersLoading}
                />
            </div>
            <div>
                This is for chip component
                {/* {value && value.length > 0 && (
                    <div className={styles.chipCollection}>
                        {value.map((key) => {
                            const option = options?.find((opt) => keySelector(opt) === key);
                            if (!option) {
                                return null;
                            }
                            const label = labelSelector(option);
                            return (
                                <Chip
                                    className={styles.chipLayout}
                                    key={key}
                                    label={label}
                                    disabled={disabled}
                                    action={!readOnly && (
                                        <>
                                            {optionEditable && onOptionEdit && (
                                                <Button
                                                    name={key}
                                                    onClick={onOptionEdit}
                                                    title="Edit Option"
                                                    disabled={disabled}
                                                    spacing="compact"
                                                    variant="general"
                                                >
                                                    <IoCreateOutline />
                                                </Button>
                                            )}
                                            <Button
                                                name={key}
                                                onClick={handleCancelOption}
                                                title="Remove"
                                                disabled={disabled}
                                                spacing="compact"
                                                variant="general"
                                            >
                                                <IoCloseOutline />
                                            </Button>
                                        </>
                                    )}
                                />
                            );
                        })}
                    </div>
                )} */}
            </div>
        </div>
    );
}

export default AdvancedFilters;
