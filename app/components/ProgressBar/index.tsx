import {
    formatNumber,
    FormatType,
    normalCommaFormatter,
} from '#utils/common';
import { Tooltip } from '@the-deep/deep-ui';
import {
    isNotDefined,
    isDefined,
    _cs,
} from '@togglecorp/fujs';
import React, { useMemo } from 'react';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight?: number;
    barName: React.ReactNode | undefined;
    valueTitle?: string | undefined;
    color?: string;
    value: number | null | undefined;
    totalValue: number | null | undefined;
    format: FormatType;
    footer?: React.ReactNode;
    hideTooltip?: boolean;
}

function ProgressBar(props: Props) {
    const {
        className,
        barHeight = 8,
        barName,
        valueTitle,
        color,
        value,
        totalValue,
        format,
        footer,
        hideTooltip = false,
    } = props;

    const valueTooltip = useMemo(() => {
        if (isNotDefined(value)) {
            return 0;
        }
        if (format === 'percent') {
            return (`${valueTitle}: ${Math.round((value ?? 0) * 10000) / 100}%` ?? undefined);
        }
        if (value < 0.999) {
            return value;
        }
        return (`${valueTitle}: ${normalCommaFormatter().format(value ?? 0)}`);
    }, [
        value,
        valueTitle,
        format,
    ]);

    const progressValue = useMemo(() => {
        if (isNotDefined(value)) {
            return 0;
        }
        if (format === 'percent') {
            return formatNumber('percent', value);
        }
        if (value < 1) {
            return '< 1';
        }
        return formatNumber(
            format,
            isDefined(totalValue) && totalValue !== 0
                ? (value ?? 0) / totalValue
                : undefined,
        );
    }, [value,
        format,
        totalValue,
    ]);

    const totalValueForWidth = formatNumber(
        'percent',
        isDefined(totalValue) && totalValue !== 0
            ? (value ?? 0) / totalValue
            : undefined,
    );

    return (
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressTitle}>
                {barName}
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
                    {progressValue}
                </div>
            </div>
            {footer}
        </div>
    );
}

export default ProgressBar;
