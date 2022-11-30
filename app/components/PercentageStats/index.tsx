import React from 'react';
import {
    ContainerCard,
    NumberOutput,
    ContainerCardProps,
    Tooltip,
    Message,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import { IoFileTraySharp } from 'react-icons/io5';

import styles from './styles.css';

type headingSizeType = ContainerCardProps['headingSize']
export interface Props {
    className?: string;
    icon?: React.ReactNode;
    heading?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headingSize?: headingSizeType;
    statValue: string | undefined;
    subValue?: number;
    newDeaths?: string | null;
    newCasesPerMillion?: string | null;
    totalDeaths?: string | null;
    newCases?: string | null;
    newDeathsPerMillion?: string | null;
    statValueLoading?: boolean;
    indicatorMonth?: string | null;
    uncertaintyRange?: string | undefined;
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
        newDeaths,
        newCasesPerMillion,
        totalDeaths,
        newCases,
        newDeathsPerMillion,
        statValueLoading,
        indicatorMonth,
        uncertaintyRange,
    } = props;

    const empty = !statValue;

    const valueTooltip = (
        (newDeaths || newCasesPerMillion) ? (
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
                <div>
                    {`Date: ${indicatorMonth ?? 'N/a'}`}
                </div>
            </Tooltip>
        ) : (
            <Tooltip>
                <div>
                    {`Total: ${statValue ?? 0}`}
                </div>
                <div>
                    {`Date: ${indicatorMonth ?? 'N/a'}`}
                </div>
                {uncertaintyRange && (
                    <div>
                        {`Uncertainty Range: ${uncertaintyRange}`}
                    </div>
                )}
            </Tooltip>
        )
    );

    return (
        <ContainerCard
            className={_cs(className, styles.percentageStatsCard)}
            headingClassName={styles.percentageHeading}
            heading={heading && (
                <>
                    <div className={styles.outbreakCard}>
                        {heading}
                    </div>
                    {valueTooltip}
                </>
            )}
            headingSize={headingSize}
            headerDescription={headerDescription && (
                <>
                    <div className={styles.outbreakCard}>
                        {headerDescription}
                    </div>
                    {valueTooltip}
                </>
            )}
            headerIconsContainerClassName={styles.iconContainer}
            headerIcons={icon}
            footerContentClassName={empty ? styles.message : styles.valueAndSubValue}
            footerContent={(empty ? (
                <Message
                    empty={empty}
                    emptyIcon={<IoFileTraySharp />}
                    pending={statValueLoading}
                    pendingContainerClassName={styles.pendingMessage}
                />
            ) : (
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
                    {valueTooltip}
                </>
            ))}
        />
    );
}
export default PercentageStats;
