import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { formatNumber, FormatType } from '#utils/common';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    minValue?: number;
    maxValue?: number;
    isPercent?: boolean;
    format?: FormatType;
}

function MapLabel(props: Props) {
    const {
        className,
        minValue,
        maxValue,
        isPercent,
        format,
    } = props;

    return (
        <div className={_cs(className, styles.mapLabel)}>
            <div className={styles.bar} />
            <div className={styles.labelContainer}>
                <div>
                    {isPercent
                        ? '0%'
                        : formatNumber(format ?? 'raw', minValue)}
                </div>
                <div>
                    {isPercent
                        ? '100%'
                        : formatNumber(format ?? 'raw', maxValue)}
                </div>
            </div>
        </div>
    );
}
export default MapLabel;
