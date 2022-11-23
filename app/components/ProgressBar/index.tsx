import React, { useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { Tooltip } from '@the-deep/deep-ui';
import {
    formatNumber,
    FormatType,
    normalCommaFormatter,
} from '#utils/common';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight?: number;
    barName: React.ReactNode | undefined;
    title: string | undefined;
    valueTitle?: string | undefined;
    color?: string;
    value: number | null | undefined;
    totalValue: number | null | undefined;
    icon?: React.ReactNode;
    format: FormatType;
    footer?: React.ReactNode;
    hideTooltip?: boolean;
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
        totalValue,
        icon,
        format,
        footer,
        hideTooltip = false,
    } = props;

    const valueTooltip = useMemo(() => {
        if (format === 'percent') {
            return (`${valueTitle}: ${Math.round((value ?? 0) * 10000) / 100}%` ?? undefined);
        }
        return (`${valueTitle}: ${normalCommaFormatter().format(value ?? 0)}`);
    }, [
        value,
        valueTitle,
        format,
    ]);

    const totalValueForWidth = formatNumber('percent', value ?? 0, totalValue ?? 0);

    return (
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressTitle}>
                {barName}
                <div title={title}>
                    {icon}
                </div>
            </div>
            <div className={styles.progressValueWrapper}>
                <div
                    className={styles.progressBarWrapper}
                    style={{ height: `${barHeight}px` }}
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
                {!hideTooltip && (
                    <Tooltip
                        trackMousePosition
                    >
                        {valueTooltip}
                    </Tooltip>
                )}
                <div
                    className={styles.progressValue}
                >
                    {format === 'percent'
                        ? formatNumber('percent', value ?? 0)
                        : formatNumber(format, value ?? 0, totalValue ?? 0)}
                </div>
            </div>
            {footer}
        </div>
    );
}

export default ProgressBar;
