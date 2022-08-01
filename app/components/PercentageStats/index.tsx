import React from 'react';
import {
    ContainerCard,
    NumberOutput,
    ContainerCardProps,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

type headingSizeType = ContainerCardProps['headingSize']
interface PercentageStatsProps {
    className?: string;
    icon: React.ReactNode;
    heading?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headingSize?: headingSizeType;
    suffix?: string;
    statValue: number;
    subValue?: number;
}

function PercentageStats(props: PercentageStatsProps) {
    const {
        className,
        icon,
        heading,
        headingSize = 'large',
        headerDescription,
        statValue,
        subValue,
        suffix,
    } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.percentageStatsCard)}
            heading={heading}
            headingSize={headingSize}
            headerDescription={headerDescription}
        >
            <div className={styles.valueDescription}>
                <div className={styles.iconContainer}>
                    {icon}
                </div>
                <div className={styles.valueAndSubValue}>
                    <NumberOutput
                        className={styles.valueText}
                        value={statValue}
                        suffix={suffix}
                    />
                    {subValue && (
                        <NumberOutput
                            className={styles.subValueText}
                            value={subValue}
                            suffix={suffix}
                        />
                    )}
                </div>
            </div>
        </ContainerCard>
    );
}
export default PercentageStats;
