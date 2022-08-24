import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight: number;
    suffix?: string;
    barName: string | undefined,
    id: string,
    title: string | undefined,
    color?: string,
    value: number | undefined,
    subValue?: number,
    totalValue: number | undefined,
    icon?: React.ReactNode
}

function ProgressBar(props: Props) {
    const {
        className,
        barHeight,
        suffix,
        barName,
        id,
        title,
        color,
        value,
        subValue,
        totalValue,
        icon,
    } = props;

    const countryPercentage = useMemo(
        () => (
            value && totalValue
            && ((value / totalValue) * 100).toFixed(0)
        ), [totalValue, value],
    );

    const subValuePercentage = useMemo(
        () => (
            subValue && totalValue
            && ((subValue / totalValue) * 100).toFixed(0)
        ), [totalValue, subValue],
    );

    const tooltip = useMemo(
        () => ((value && totalValue)
            && ((`${title}: ${value ?? '0'}`) ?? undefined)
        ), [totalValue, value, title],
    );

    return (
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressTitle}>
                {barName}
                {icon}
            </div>
            <div className={styles.progressValueWrapper}>
                <div
                    className={styles.progressBarWrapper}
                    style={{ height: `${barHeight}px` }}
                    title={tooltip as string}
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
                    title={tooltip as string}
                >
                    {countryPercentage}
                    {suffix}
                </div>
            </div>
            {subValuePercentage && (
                <div className={styles.subValue}>
                    {`Regional ${subValue}${suffix}`}
                </div>
            )}
        </div>
    );
}
export default ProgressBar;
