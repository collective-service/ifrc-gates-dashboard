import React, { useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight?: number;
    suffix?: string;
    barName: string | undefined;
    id: number;
    title: string | undefined;
    valueTitle?: string | undefined;
    color?: string;
    value: number | undefined;
    subValue?: number;
    totalValue: number | undefined;
    icon?: React.ReactNode;
    region?: string;
    isNumberValue?: boolean;
}

function ProgressBar(props: Props) {
    const {
        className,
        barHeight = 8,
        suffix,
        barName,
        id,
        title,
        valueTitle,
        color,
        value,
        subValue,
        totalValue,
        icon,
        region,
        isNumberValue = false,
    } = props;

    const countryPercentage = useMemo(() => {
        if (isNotDefined(value) || isNotDefined(totalValue)) {
            return undefined;
        }
        if (isNumberValue) {
            return (value / 1000000).toFixed(2);
        }
        return ((value / totalValue) * 100).toFixed(0);
    }, [totalValue, value],
    );

    const subValuePercentage = useMemo(
        () => (
            subValue && totalValue
            && ((subValue / totalValue) * 100).toFixed(0)
        ), [totalValue, subValue],
    );

    const valueTooltip = useMemo(() => (
        (value && totalValue) && (`${valueTitle}: ${value ?? '0'}` ?? undefined)
    ), [totalValue, value, valueTitle]);

    return (
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressTitle}>
                {barName}
                <div
                    title={title}
                >
                    {icon}
                </div>
            </div>
            <div className={styles.progressValueWrapper}>
                <div
                    className={styles.progressBarWrapper}
                    style={{ height: `${barHeight}px` }}
                    title={valueTooltip as string}
                >
                    <div
                        className={styles.progressBarStyle}
                        key={id}
                        style={{
                            width: `${countryPercentage}%`,
                            backgroundColor: color ?? 'blue',
                        }}
                    />
                </div>
                <div
                    className={styles.progressValue}
                    title={valueTooltip as string}
                >
                    {countryPercentage}
                    {suffix}
                </div>
            </div>
            {subValuePercentage && (
                <div className={styles.subValue}>
                    {`${region}: ${subValuePercentage}${suffix}`}
                </div>
            )}
        </div>
    );
}
export default ProgressBar;
