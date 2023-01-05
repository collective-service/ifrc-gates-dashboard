import React, { useCallback, useMemo } from 'react';
import {
    RadioInput,
    TextInput,
    MultiSelectInput,
    Button,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { IoClose } from 'react-icons/io5';
import MultiChipInput from '#components/MultiChipInput';

import {
    AdvancedFilterOptionsQuery,
    AdvancedFilterOptionsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

export type ThematicsOption = NonNullable<NonNullable<AdvancedFilterOptionsQuery['filterOptions']>['thematics']>[number];
export type TopicsOption = NonNullable<NonNullable<AdvancedFilterOptionsQuery['filterOptions']>['topics']>[number];

export interface AdvancedOptionType {
    type?: string;
    thematics?: string[];
    topics?: string[];
}

interface Thematic {
    key: string;
    label: string;
}

const ADVANCED_FILTER_OPTIONS = gql`
query AdvancedFilterOptions($thematics: [String!], $type: String) {
        filterOptions {
            types
            thematics(type: $type)
            topics(thematics: $thematics)
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
    keywordSearchText: string | undefined;
    setKeywordSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function AdvancedFilters(props: Props) {
    const {
        value,
        onChange,
        keywordSearchText,
        setKeywordSearchText,
    } = props;

    const filterOptionsVariables = useMemo((): AdvancedFilterOptionsQueryVariables => ({
        type: value?.type ?? '',
        thematics: value?.thematics ?? undefined,
    }), [
        value?.type,
        value?.thematics,
    ]);

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
                        thematics: undefined,
                        topics: undefined,
                    }));
                } else if (name === 'thematics') {
                    onChange((oldValue) => ({
                        ...oldValue,
                        thematics: newValue as string[],
                        topics: undefined,
                    }));
                } else if (name === 'topics') {
                    onChange((oldValue) => ({
                        ...oldValue,
                        topics: newValue as string[],
                    }));
                } else {
                    onChange((oldValue) => ({
                        ...oldValue,
                        [name]: newValue as string,
                    }));
                }
            }
        },
        [
            onChange,
        ],
    );

    const handleClearAdvancedFilters = useCallback(() => {
        onChange({});
    }, [onChange]);

    const handleClearKeywords = useCallback(() => {
        setKeywordSearchText(undefined);
    }, [setKeywordSearchText]);

    const advancedFiltersSelected = (
        (value?.thematics && value.thematics.length > 0)
        || (value?.topics && value.topics.length > 0));

    return (
        <div className={styles.thematicFilterSection}>
            <div className={styles.advancedFilters}>
                <RadioInput
                    name="type"
                    keySelector={filterTypeKeySelector}
                    label="Type"
                    labelSelector={filterTypeLabelSelector}
                    options={types}
                    value={value?.type}
                    onChange={handleInputChange}
                    disabled={advancedFiltersLoading}
                />
                <MultiSelectInput
                    name="thematics"
                    options={thematicOptions}
                    placeholder="Thematic"
                    keySelector={thematicKeySelector}
                    labelSelector={thematicLabelSelector}
                    value={value?.thematics}
                    onChange={handleInputChange}
                    variant="general"
                    disabled={advancedFiltersLoading}
                />
                <MultiSelectInput
                    name="topics"
                    options={topicOptions}
                    placeholder="Topic"
                    keySelector={topicKeySelector}
                    labelSelector={topicLabelSelector}
                    value={value?.topics}
                    onChange={handleInputChange}
                    variant="general"
                    disabled={advancedFiltersLoading}
                />
                <TextInput
                    name="keywords"
                    variant="general"
                    placeholder="Keywords"
                    value={keywordSearchText}
                    onChange={setKeywordSearchText}
                    actions={keywordSearchText && (
                        <Button
                            name={undefined}
                            variant="transparent"
                            icons={<IoClose />}
                            onClick={handleClearKeywords}
                            className={styles.clearButton}
                        />
                    )}
                />
            </div>
            <div>
                {value?.thematics && value.thematics.length > 0 && (
                    <MultiChipInput
                        name="thematics"
                        label="Thematics filters"
                        value={value?.thematics}
                        onChange={handleInputChange}
                        disabled={advancedFiltersLoading}
                    />
                )}
                {value?.topics && value.topics.length > 0 && (
                    <MultiChipInput
                        name="topics"
                        label="Topics filters"
                        value={value?.topics}
                        onChange={handleInputChange}
                        disabled={advancedFiltersLoading}
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
