import {
    formatNumber,
    FormatType,
} from '#utils/common';
import { Tooltip } from '@the-deep/deep-ui';
import {
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

    const actualValue = useMemo(() => {
        if (format === 'percent') {
            return isDefined(value) ? value * 100 : undefined;
        }
        return isDefined(totalValue) && totalValue !== 0
            ? ((value ?? 0) / totalValue) * 100
            : undefined;
    }, [
        value,
        format,
        totalValue,
    ]);

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
                            width: isDefined(actualValue)
                                ? `${actualValue}%`
                                : 0,
                            backgroundColor: color ?? 'blue',
                        }}
                    />
                </div>
                {!hideTooltip && (
                    <Tooltip
                        trackMousePosition
                    >
                        {/* FIXME: pass prop to show decimal here */}
                        {`${valueTitle}: ${formatNumber(format, value, false)}`}
                    </Tooltip>
                )}
                <div
                    className={styles.progressValue}
                >
                    {formatNumber(format, value)}
                </div>
            </div>
            {footer}
        </div>
    );
}

export default ProgressBar;
