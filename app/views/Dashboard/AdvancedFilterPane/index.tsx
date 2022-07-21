import React, { useCallback, useState } from 'react';
import {
    Container,
    Button,
    RadioInput,
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

function AdvancedFilterPane() {
    const handleApplyFiltersClick = useCallback(() => {
        // eslint-disable-next-line no-console
        console.warn('I will apply filters');
    }, []);

    const [activeFilterType, setActiveFilterType] = useState<string>('contextualIndicators');

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
        </Container>
    );
}

export default AdvancedFilterPane;
