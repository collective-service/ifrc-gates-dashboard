import React from 'react';
import {
    ContainerCard,
    NumberOutput,
    ContainerCardProps,
    Tooltip,
    Message,
} from '@the-deep/deep-ui';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { IoFileTraySharp } from 'react-icons/io5';
import { formatNumber, FormatType } from '#utils/common';

import styles from './styles.css';

type headingSizeType = ContainerCardProps['headingSize']
export interface Props {
    className?: string;
    icon?: React.ReactNode;
    heading?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headingSize?: headingSizeType;
    statValue: number | undefined | null;
    format: FormatType;
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
        format,
    } = props;

    const empty = isNotDefined(statValue);

    const valueTooltip = (
        (newDeaths || newCasesPerMillion) ? (
            <Tooltip>
                <div>
                    {`Total Cases: ${statValue ? formatNumber(format, statValue, false) : 'N/a'}`}
                </div>
                <div>
                    {`New Cases: ${newCases ?? 'N/a'}`}
                </div>
                <div>
                    {`New Deaths: ${newDeaths ?? 'N/a'}`}
                </div>
                <div>
                    {`Total Deaths: ${totalDeaths ?? 'N/a'}`}
                </div>
                <div>
                    {`Cases Per Million: ${newCasesPerMillion ?? 'N/a'}`}
                </div>
                <div>
                    {`Deaths Per Million: ${newDeathsPerMillion ?? 'N/a'}`}
                </div>
                <div>
                    {`Date: ${indicatorMonth ?? 'N/a'}`}
                </div>
            </Tooltip>
        ) : (
            <Tooltip>
                <div>
                    {`Total: ${formatNumber(format, statValue, false)}`}
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
            footerContentClassName={styles.valueAndSubValue}
            footerContent={(!empty && (
                <>
                    <div className={styles.valueText}>
                        {formatNumber(format, statValue, true)}
                    </div>
                    {
                        subValue && (
                            <NumberOutput
                                className={styles.subValueText}
                                value={subValue}
                            />
                        )
                    }
                    {valueTooltip}
                </>
            ))}
        >
            {empty && (
                <Message
                    empty={empty}
                    emptyIcon={<IoFileTraySharp />}
                    pending={statValueLoading}
                    pendingContainerClassName={styles.pendingMessage}
                />
            )}
        </ContainerCard>
    );
}
export default PercentageStats;
