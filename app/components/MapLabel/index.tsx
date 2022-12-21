import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { formatNumber, FormatType } from '#utils/common';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    minValue: number;
    maxValue: number;
    format: FormatType;
}

function MapLabel(props: Props) {
    const {
        className,
        minValue,
        maxValue,
        format,
    } = props;

    return (
        <div className={_cs(className, styles.mapLabel)}>
            <div className={styles.bar} />
            <div className={styles.labelContainer}>
                <div>
                    {minValue < 1 ? 0 : formatNumber(format, minValue, false) ?? 'N/a'}
                </div>
                <div>
                    {formatNumber(format, maxValue) ?? 'N/a'}
                </div>
            </div>
        </div>
    );
}
export default MapLabel;
