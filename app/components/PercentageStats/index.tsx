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
    indicatorDescription?: string | null;
    headerDescription?: React.ReactNode;
    headingSize?: headingSizeType;
    suffix?: string;
    statValue: number | null | undefined;
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
        suffix,
        newDeaths,
        newCasesPerMillion,
    } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.percentageStatsCard)}
            headingClassName={styles.percentageHeading}
            heading={(
                <>
                    {indicatorDescription && indicatorDescription}
                    {(!indicatorDescription && !heading) && 'Total number of cases'}
                    {heading && (
                        <>
                            {`Total number of ${heading} cases`}
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

                    <NumberOutput
                        className={styles.valueText}
                        value={statValue}
                        normal
                        precision="auto"
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
