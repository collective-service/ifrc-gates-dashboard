import React from 'react';
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
    subHeading?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headingSize?: headingSizeType;
    statValue: string | undefined;
    subValue?: number;
    newDeaths?: string | null;
    newCasesPerMillion?: string | null;
    totalDeaths?: string | null;
    newCases?: string | null;
    newDeathsPerMillion?: string | null;
}

function PercentageStats(props: Props) {
    const {
        className,
        icon,
        heading,
        subHeading,
        headingSize = 'extraSmall',
        headerDescription,
        statValue,
        subValue,
        newDeaths,
        newCasesPerMillion,
        totalDeaths,
        newCases,
        newDeathsPerMillion,
    } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.percentageStatsCard)}
            headingClassName={styles.percentageHeading}
            heading={(
                <>
                    {(heading || subHeading) && (
                        <>
                            <div className={styles.outbreakCard}>
                                <span>
                                    {heading}
                                </span>
                                {subHeading}
                            </div>
                            {(newDeaths || newCasesPerMillion) && (
                                <Tooltip>
                                    <div>
                                        {`New Cases: ${newCases ?? 0}`}
                                    </div>
                                    <div>
                                        {`New Deaths: ${newDeaths ?? 0}`}
                                    </div>
                                    <div>
                                        {`Total Deaths: ${totalDeaths ?? 0}`}
                                    </div>
                                    <div>
                                        {`Cases Per Million: ${newCasesPerMillion ?? 0}`}
                                    </div>
                                    <div>
                                        {`Deaths Per Million: ${newDeathsPerMillion ?? 0}`}
                                    </div>
                                </Tooltip>
                            )}
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
                    <div className={styles.valueText}>
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
