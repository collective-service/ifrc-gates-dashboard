import React, { useMemo, useCallback } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { Button } from '@the-deep/deep-ui';
import {
    formatNumber,
    FormatType,
} from '#utils/common';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight?: number;
    barName: string | undefined;
    title: string | undefined;
    valueTitle?: string | undefined;
    color?: string;
    value: number | null | undefined;
    subValue?: number;
    totalValue: number | null | undefined;
    icon?: React.ReactNode;
    region?: string;
    showRegionalValue?: boolean;
    indicatorId?: string;
    subVariable?: string;
    onTitleClick?: (indicatorId?: string, subVariable?: string) => void;
    format: FormatType;
}

function ProgressBar(props: Props) {
    const {
        className,
        barHeight = 8,
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
        onTitleClick,
        indicatorId,
        subVariable,
        format,
    } = props;

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

    const subValuePercentage = useMemo(() => (
        `${region}: ${formatNumber('percent', subValue ?? 0)}`
    ), [
        subValue,
        region,
    ]);

    const valueTooltip = useMemo(() => {
        if (format === 'percent') {
            return (`${valueTitle}: ${formatNumber(format, value ?? 0)}` ?? undefined);
        }
        return (`${valueTitle}: ${value}`);
    }, [
        value,
        valueTitle,
        format,
    ]);

    const totalValueForWidth = formatNumber('percent', value ?? 0, totalValue ?? 0);

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
                            width: totalValueForWidth,
                            backgroundColor: color ?? 'blue',
                        }}
                    />
                </div>
                <div
                    className={styles.progressValue}
                    title={valueTooltip as string}
                >
                    {format === 'percent'
                        ? formatNumber('percent', value ?? 0)
                        : formatNumber(format, value ?? 0, totalValue ?? 0)}
                </div>
            </div>
            {showRegionalValue && subValuePercentage && (
                <div className={styles.subValue}>
                    {subValuePercentage}
                </div>
            )}
        </div>
    );
}
export default ProgressBar;
