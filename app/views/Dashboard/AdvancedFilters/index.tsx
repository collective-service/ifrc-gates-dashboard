import React, { useCallback, useMemo } from 'react';
import Select, { MultiValue } from 'react-select';

import { listToMap } from '@togglecorp/fujs';
import {
    RadioInput,
    SelectInput,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import {
    ThematicsQuery,
    ThematicsQueryVariables,
    TopicsQuery,
    TopicsQueryVariables,
    TypesQuery,
    TypesQueryVariables,
} from '#generated/types';

import styles from './styles.css';

export interface AdvancedOptionType {
    type?: string;
    thematic?: string;
    topic?: string;
    keywords?: string[];
}

const THEMATICS = gql`
    query Thematics($type: String!) {
        filterOptions {
            thematics(type: $type)
        }
    }
`;

interface Thematic {
    key: string;
    label: string;
}

const thematicKeySelector = (d: Thematic) => d.key;
const thematicLabelSelector = (d: Thematic) => d.label;

const TYPES = gql`
    query Types {
        filterOptions {
            types
        }
    }
`;

interface FilterType {
    key: string;
    label: string;
}

const filterTypeKeySelector = (d: FilterType) => d.key;
const filterTypeLabelSelector = (d: FilterType) => d.label;

const TOPICS = gql`
    query Topics($thematic: String!) {
        filterOptions {
            topics(thematic: $thematic)
        }
    }
`;

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

    const {
        data: typeList,
        loading: typesLoading,
    } = useQuery<TypesQuery, TypesQueryVariables>(
        TYPES,
    );

    const types = typeList?.filterOptions?.types.map((t) => ({
        key: t,
        label: t,
    }));

    const thematicVariables = useMemo(() => ({
        type: value?.type ?? '',
    }), [value?.type]);

    const {
        data: thematicList,
        loading: thematicsLoading,
    } = useQuery<ThematicsQuery, ThematicsQueryVariables>(
        THEMATICS,
        {
            variables: thematicVariables,
        },
    );

    const thematics = thematicList?.filterOptions?.thematics.map((t) => ({
        key: t,
        label: t,
    }));

    const topicVariables = useMemo(() => ({
        thematic: value?.thematic ?? '',
    }), [value?.thematic]);

    const {
        data: topicList,
        loading: topicsLoading,
    } = useQuery<TopicsQuery, TopicsQueryVariables>(
        TOPICS,
        {
            variables: topicVariables,
        },
    );

    const topics = topicList?.filterOptions?.topics.map((t) => ({
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
                disabled={typesLoading}
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
                disabled={thematicsLoading}
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
                disabled={topicsLoading}
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
