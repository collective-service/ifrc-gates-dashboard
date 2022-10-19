import React, { useMemo } from 'react';
import {
    ContainerCard,
    NumberOutput,
    ContainerCardProps,
    Tooltip,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

type headingSizeType = ContainerCardProps['headingSize']
export interface Props {
    className?: string;
    icon?: React.ReactNode;
    heading?: React.ReactNode;
    indicatorDescription?: string | null;
    headerDescription?: React.ReactNode;
    headingSize?: headingSizeType;
    statValue: string | undefined;
    subValue?: number;
    newDeaths?: number | null;
    newCasesPerMillion?: number | null;
}

function PercentageStats(props: Props) {
    const {
        className,
        icon,
        heading,
        headingSize = 'extraSmall',
        headerDescription,
        indicatorDescription,
        statValue,
        subValue,
        newDeaths,
        newCasesPerMillion,
    } = props;

    const formattedHeading = useMemo(() => (
        <div className={styles.outbreakCard}>
            Total number of
            <span className={styles.outbreakCardTitle}>
                {` ${heading} `}
            </span>
            cases
        </div>
    ), [heading]);

    return (
        <ContainerCard
            className={_cs(className, styles.percentageStatsCard)}
            headingClassName={styles.percentageHeading}
            heading={(
                <>
                    {indicatorDescription}
                    {(!indicatorDescription && !heading) && 'Total Percentage'}
                    {heading && (
                        <>
                            {formattedHeading}
                            <Tooltip>
                                <div>
                                    {`Deaths: ${newDeaths}`}
                                </div>
                                <div>
                                    {`Cases Per Million: ${newCasesPerMillion}`}
                                </div>
                            </Tooltip>
                        </>
                    )}
                </>
            )}
            headingSize={headingSize}
            headerDescription={headerDescription}
            headerIconsContainerClassName={styles.iconContainer}
            headerIcons={icon}
            footerContentClassName={styles.valueAndSubValue}
            footerContent={(
                <>
                    <div
                        className={styles.valueText}
                    >
                        {statValue}
                    </div>
                    {subValue && (
                        <NumberOutput
                            className={styles.subValueText}
                            value={subValue}
                        />
                    )}
                </>
            )}
        />
    );
}
export default PercentageStats;
