import React, { useMemo, useCallback } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { Button } from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight?: number;
    suffix?: string;
    barName: string | undefined;
    title: string | undefined;
    valueTitle?: string | undefined;
    color?: string;
    value: number | undefined;
    subValue?: number;
    totalValue: number | undefined;
    icon?: React.ReactNode;
    region?: string;
    showRegionalValue?: boolean;
    isNumberValue?: boolean;
    indicatorId?: string;
    subVariable?: string;
    onTitleClick?: (indicatorId?: string, subVariable?: string) => void;
}

function ProgressBar(props: Props) {
    const {
        className,
        barHeight = 8,
        suffix,
        barName,
        title,
        valueTitle,
        color,
        value,
        subValue,
        totalValue,
        icon,
        region,
        showRegionalValue = false,
        isNumberValue = false,
        onTitleClick,
        indicatorId,
        subVariable,
    } = props;

    const countryPercentage = useMemo(() => {
        if (isNotDefined(value) || isNotDefined(totalValue)) {
            return undefined;
        }
        if (isNumberValue) {
            return (value / 1000000).toFixed(2);
        }
        return ((value / totalValue) * 100).toFixed(0);
    }, [
        totalValue,
        value,
        isNumberValue,
    ]);

    const handleTitleClick = useCallback(() => {
        if (!onTitleClick) {
            return;
        }
        onTitleClick(indicatorId, subVariable);
    }, [
        onTitleClick,
        indicatorId,
        subVariable,
    ]);

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
                {indicatorId
                    ? (
                        <Button
                            className={styles.titleButton}
                            name={undefined}
                            onClick={handleTitleClick}
                            variant="transparent"
                        >
                            {barName}
                        </Button>
                    )
                    : barName}
                <div title={title}>
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
                        key={undefined}
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
            {showRegionalValue && subValuePercentage && (
                <div className={styles.subValue}>
                    {`${region}: ${subValuePercentage}${suffix}`}
                </div>
            )}
        </div>
    );
}
export default ProgressBar;
