import React, { useState } from 'react';

import {
    RadioInput,
    SelectInput,
    TextInput,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface FilterType {
    key: string;
    label: string;
}
const filterType: FilterType[] = [
    {
        key: '1',
        label: 'Social Behavioural Indicators',
    },
    {
        key: '2',
        label: 'Contextual Indicators',
    },
];

const filterTypeKeySelector = (d: FilterType) => d.key;
const filterTypeLabelSelector = (d: FilterType) => d.label;

interface Thematic {
    key: string;
    label: string;
}

const thematic: Thematic[] = [
    {
        key: '1',
        label: 'Communication',
    },
    {
        key: '2',
        label: 'Disease',
    },
    {
        key: '3',
        label: 'Prevention',
    },
    {
        key: '4',
        label: 'Health Care',
    },
    {
        key: '5',
        label: 'Community Engagement',
    },
    {
        key: '6',
        label: 'Impact',
    },
    {
        key: '7',
        label: 'General',
    },
    {
        key: '8',
        label: 'Epidemiology',
    },
    {
        key: '9',
        label: 'Health Services',
    },
    {
        key: '10',
        label: 'Socio-Economic',
    },
];

const thematicKeySelector = (d: Thematic) => d.key;
const thematicLabelSelector = (d: Thematic) => d.label;

interface Topic {
    key: string;
    label: string;
}
const topic: Topic[] = [
    {
        key: '1',
        label: 'Sources',
    },
    {
        key: '2',
        label: 'Channels',
    },
    {
        key: '3',
        label: 'Misinformation',
    },
    {
        key: '3',
        label: 'Misinformation',
    },
    {
        key: '4',
        label: 'Access',
    },
    {
        key: '5',
        label: 'Access for other treatments',
    },
];

const topicKeySelector = (d: Topic) => d.key;
const topicLabelSelector = (d: Topic) => d.label;

function AdvancedFilters() {
    const [
        selectedThematic,
        setSelectedThematic,
    ] = useState<string | undefined>('1');

    const [
        selectedFilterType,
        setSelectedFilterType,
    ] = useState<string | undefined>('1');

    const [
        selectedTopic,
        setSelectedTopic,
    ] = useState<string | undefined>('1');

    return (
        <div className={styles.advancedFilters}>
            <RadioInput
                name="type"
                keySelector={filterTypeKeySelector}
                label="Type"
                labelSelector={filterTypeLabelSelector}
                options={filterType}
                value={selectedFilterType}
                onChange={setSelectedFilterType}
            />
            <SelectInput
                name="thematic"
                options={thematic}
                placeholder="Thematic"
                keySelector={thematicKeySelector}
                labelSelector={thematicLabelSelector}
                value={selectedThematic}
                onChange={setSelectedThematic}
            />
            <SelectInput
                name="topic"
                options={topic}
                placeholder="Topic"
                keySelector={topicKeySelector}
                labelSelector={topicLabelSelector}
                value={selectedTopic}
                onChange={setSelectedTopic}
            />
            {/* FIX ME: MAKE MULTI SELECT INPUTS */}
            <TextInput
                name="keywords"
                placeholder="Keywords"
                value=""
            />
        </div>
    );
}

export default AdvancedFilters;
