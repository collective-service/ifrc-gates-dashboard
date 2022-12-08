import React, { useCallback, useMemo, useState } from 'react';
import {
    RadioInput,
    MultiSelectInput,
    Button,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { IoCloseOutline, IoClose } from 'react-icons/io5';
import Chip from '#components/Chip';

import {
    AdvancedFilterOptionsQuery,
    AdvancedFilterOptionsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

export type ThematicsOption = NonNullable<NonNullable<AdvancedFilterOptionsQuery['filterOptions']>['thematics']>[number];
export type TopicsOption = NonNullable<NonNullable<AdvancedFilterOptionsQuery['filterOptions']>['topics']>[number];

interface ChipProps {
    name: string;
    value?: string[] | null | undefined;
    onChange: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}

function ChipLayout(props: ChipProps) {
    const {
        name,
        value,
        onChange,
    } = props;

    const handleCancelOption = useCallback(
        (selectedKey) => {
            const newValue = value?.filter((key) => key !== selectedKey) ?? [];
            onChange(newValue);
        },
        [value, onChange],
    );

    return (
        <div className={styles.chipComponent}>
            <div className={styles.chipFilterHeader}>
                {`${name} filters:`}
            </div>
            <div className={styles.chipCollection}>
                {value?.map((key) => {
                    const label = key;
                    return (
                        <Chip
                            key={key}
                            label={label}
                            actionClassName={styles.chipActionButtons}
                            action={(
                                <Button
                                    name={key}
                                    onClick={handleCancelOption}
                                    title="Remove"
                                    spacing="none"
                                    variant="transparent"
                                >
                                    <IoCloseOutline />
                                </Button>
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
}

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
        selectedThematicOptions,
        setSelectedThematicOptions,
    ] = useState<ThematicsOption[] | undefined>([]);

    const [
        selectedTopicOptions,
        setSelectedTopicOptions,
    ] = useState<TopicsOption[] | undefined>([]);

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

    const thematicOptions = useMemo(() => (
        advancedFilterOptions?.filterOptions?.thematics.map((t) => ({
            key: t,
            label: t,
        }))
    ), [advancedFilterOptions]);

    const topicOptions = useMemo(() => (
        advancedFilterOptions?.filterOptions?.topics.map((t) => ({
            key: t,
            label: t,
        }))
    ), [advancedFilterOptions]);

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
                    setSelectedThematicOptions(undefined);
                    setSelectedTopicOptions(undefined);
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

    const handleClearAdvancedFilters = useCallback(
        () => {
            onChange({});
            setSelectedThematicOptions(undefined);
            setSelectedTopicOptions(undefined);
        },
        [onChange],
    );

    const advancedFiltersSelected = (
        (selectedThematicOptions && selectedThematicOptions?.length > 0)
        || (selectedTopicOptions && selectedTopicOptions?.length > 0));

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
                <MultiSelectInput
                    name="thematic"
                    className={styles.filter}
                    options={thematicOptions}
                    placeholder="Thematic"
                    keySelector={thematicKeySelector}
                    labelSelector={thematicLabelSelector}
                    value={selectedThematicOptions}
                    onChange={setSelectedThematicOptions}
                    variant="general"
                    disabled={advancedFiltersLoading}
                />
                <MultiSelectInput
                    name="topic"
                    className={styles.filter}
                    options={topicOptions}
                    placeholder="Topic"
                    keySelector={topicKeySelector}
                    labelSelector={topicLabelSelector}
                    value={selectedTopicOptions}
                    onChange={setSelectedTopicOptions}
                    variant="general"
                    disabled={advancedFiltersLoading}
                />
            </div>
            <div>
                {selectedThematicOptions && selectedThematicOptions.length > 0 && (
                    <ChipLayout
                        name="Thematic"
                        value={selectedThematicOptions}
                        onChange={setSelectedThematicOptions}
                    />
                )}
                {selectedTopicOptions && selectedTopicOptions.length > 0 && (
                    <ChipLayout
                        name="Topic"
                        value={selectedTopicOptions}
                        onChange={setSelectedTopicOptions}
                    />
                )}
                {advancedFiltersSelected && (
                    <Button
                        name={undefined}
                        variant="transparent"
                        icons={<IoClose />}
                        onClick={handleClearAdvancedFilters}
                        className={styles.clearButton}
                    >
                        Clear all
                    </Button>
                )}
            </div>
        </div>
    );
}

export default AdvancedFilters;
