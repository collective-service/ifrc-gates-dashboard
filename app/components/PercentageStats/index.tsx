import React from 'react';
import {
    ContainerCard,
    CompactInformationCard,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export declare type SpacingTypes = 'none' | 'compact' | 'comfortable' | 'loose';

interface PercentageStatsProps {
    className?: string;
    heading?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headingSize?: 'large' | 'small' | 'extraSmall' | 'medium' | 'extraLarge' | undefined;
    StatValue: number;
    StatValueSpacing?: SpacingTypes | undefined;
    StatValueDescription: string | undefined;
    StatValueIcon?: React.ReactNode;
}

function PercentageStats(props: PercentageStatsProps) {
    const {
        className,
        heading,
        headingSize = 'large',
        headerDescription,
        StatValue,
        StatValueSpacing,
        StatValueDescription,
        StatValueIcon,
    } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.percentageStatsCard)}
            heading={heading}
            headingSize={headingSize}
            headerDescription={headerDescription}
        >
            <CompactInformationCard
                className={styles.statCard}
                icon={StatValueIcon}
                label={StatValueDescription}
                spacing={StatValueSpacing}
                value={StatValue}
            />
        </ContainerCard>
    );
}
export default PercentageStats;
