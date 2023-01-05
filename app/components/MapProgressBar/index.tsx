import React, { useMemo, useCallback } from 'react';
import {
    isDefined,
    _cs,
} from '@togglecorp/fujs';
import { Tooltip } from '@the-deep/deep-ui';
import {
    formatNumber,
    FormatType,
} from '#utils/common';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight?: number;
    barName: React.ReactNode | undefined;
    emergency?: string | undefined;
    countryCode?: string | undefined;
    color?: string;
    value: number | null | undefined;
    totalValue: number | null | undefined;
    format: FormatType;
    footer?: React.ReactNode;
    hideTooltip?: boolean;
    setCountryCode: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function MapProgressBar(props: Props) {
    const {
        className,
        barHeight = 8,
        barName,
        emergency,
        countryCode,
        color,
        value,
        totalValue,
        format,
        footer,
        hideTooltip = false,
        setCountryCode,
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

    const handleMapProgressClick = useCallback(() => {
        setCountryCode(countryCode);
    }, [
        countryCode,
        setCountryCode,
    ]);

    return (
        <div
            className={_cs(className, styles.progressInfo)}
            onClick={handleMapProgressClick}
            role="presentation"
        >
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
                        {`${emergency ?? 'N/a'}: ${value ? formatNumber(format, value, false) : 'N/a'}`}
                    </Tooltip>
                )}
                <div
                    className={styles.progressValue}
                >
                    {format === 'percent'
                        ? formatNumber('percent', value ?? 0)
                        : formatNumber(format, value ?? 0, !!totalValue)}
                </div>
            </div>
            {footer}
        </div>
    );
}

export default MapProgressBar;
