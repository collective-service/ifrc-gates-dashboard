import React, { useMemo, useCallback } from 'react';
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

    const valueTooltip = useMemo(() => {
        if (format === 'percent') {
            return (`${emergency ?? 'N/a'}: ${Math.round((value ?? 0) * 10000) / 100}%` ?? 'N/a');
        }
        return (`${emergency ?? 'N/a'}: ${value ? normalCommaFormatter().format(value) : 'N/a'}`);
    }, [
        value,
        emergency,
        format,
    ]);

    const totalValueForWidth = formatNumber('percent', value ?? 0, !!totalValue);

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
                        : formatNumber(format, value ?? 0, !!totalValue)}
                </div>
            </div>
            {footer}
        </div>
    );
}

export default MapProgressBar;
