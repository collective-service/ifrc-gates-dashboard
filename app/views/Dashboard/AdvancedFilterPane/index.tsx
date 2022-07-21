import React, { useCallback, useState } from 'react';
import {
    Container,
    Button,
    RadioInput,
    SelectInput,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface FilterTypeEnum {
    name: string;
    title: string;
}

const filterTypes: FilterTypeEnum[] = [
    {
        name: 'socialBehaviouralIndicators',
        title: 'Social Behavioural Indicators',
    },
    {
        name: 'contextualIndicators',
        title: 'Contextual Indicators',
    },
];

const filterTypeKeySelector = (d: FilterTypeEnum) => d.name;
const filterTypeLabelSelector = (d: FilterTypeEnum) => d.title;

interface ThematicFilterType {
    id: string;
    title: string;
    parent: FilterTypeEnum['name'];
}
const thematicFilterItems: ThematicFilterType[] = [
    {
        id: '1',
        title: 'Communication',
        parent: 'socialBehaviouralIndicators',
    },
    {
        id: '2',
        title: 'Disease',
        parent: 'socialBehaviouralIndicators',
    },
    {
        id: '3',
        title: 'Prevention',
        parent: 'socialBehaviouralIndicators',
    },
    {
        id: '4',
        title: 'Health Care',
        parent: 'socialBehaviouralIndicators',
    },
    {
        id: '5',
        title: 'Impact Migration',
        parent: 'socialBehaviouralIndicators',
    },
    {
        id: '6',
        title: 'Community Engagement',
        parent: 'socialBehaviouralIndicators',
    },
    {
        id: '7',
        title: 'General',
        parent: 'contextualIndicators',
    },
    {
        id: '8',
        title: 'Epidemiology',
        parent: 'contextualIndicators',
    },
    {
        id: '9',
        title: 'Health Services',
        parent: 'contextualIndicators',
    },
    {
        id: '10',
        title: 'Other Services',
        parent: 'contextualIndicators',
    },
    {
        id: '11',
        title: 'Poltics',
        parent: 'contextualIndicators',
    },
    {
        id: '12',
        title: 'Socio-Economic',
        parent: 'contextualIndicators',
    },
];

const thematicKeySelector = (d: ThematicFilterType) => d.id;
const thematicLabelSelector = (d: ThematicFilterType) => d.title;

function AdvancedFilterPane() {
    const handleApplyFiltersClick = useCallback(() => {
        // eslint-disable-next-line no-console
        console.warn('I will apply filters');
    }, []);

    const [activeFilterType, setActiveFilterType] = useState<string>('contextualIndicators');
    const [thematicFilterValue, setThematicFilterValue] = useState<string | undefined>();

    const handleChange = useCallback((data: string | undefined) => {
        setThematicFilterValue(data);
    }, []);

    return (
        <Container
            className={styles.filterPane}
            heading="Advanced Options"
            headingDescription="Description of advanced features here"
            headingDescriptionClassName={styles.headingDescription}
            headingSize="small"
            headerActions={(
                <Button
                    name={undefined}
                    variant="transparent"
                    disabled
                    // FIXME: Add a filter clear option on button click
                >
                    clear all
                </Button>
            )}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleApplyFiltersClick}
                >
                    Apply
                </Button>
            )}
        >
            <RadioInput
                name={undefined}
                keySelector={filterTypeKeySelector}
                labelSelector={filterTypeLabelSelector}
                label="Type"
                options={filterTypes}
                value={activeFilterType}
                onChange={setActiveFilterType}
            />
            <div className={styles.filterOptions}>
                <SelectInput
                    name="thematic"
                    options={thematicFilterItems}
                    keySelector={thematicKeySelector}
                    labelSelector={thematicLabelSelector}
                    placeholder="Thematic"
                    value={thematicFilterValue}
                    onChange={handleChange}
                />
            </div>
        </Container>
    );
}

export default AdvancedFilterPane;
