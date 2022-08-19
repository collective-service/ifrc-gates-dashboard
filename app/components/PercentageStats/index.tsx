import React from 'react';
import {
    ContainerCard,
    NumberOutput,
    ContainerCardProps,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

type headingSizeType = ContainerCardProps['headingSize']
export interface Props {
    className?: string;
    icon?: React.ReactNode;
    heading?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headingSize?: headingSizeType;
    suffix?: string;
    statValue: number | null | undefined;
    subValue?: number;
}

function PercentageStats(props: Props) {
    const {
        className,
        icon,
        heading,
        headingSize = 'extraSmall',
        headerDescription,
        statValue,
        subValue,
        suffix,
    } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.percentageStatsCard)}
            headingClassName={styles.percentageHeading}
            heading={heading}
            headingSize={headingSize}
            headerDescription={headerDescription}
            headerIconsContainerClassName={styles.iconContainer}
            headerIcons={icon}
            footerContentClassName={styles.valueAndSubValue}
            footerContent={(
                <>
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
                </>
            )}
        />
    );
}
export default PercentageStats;
