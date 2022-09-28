import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    minValue?: number;
    maxValue?: number;
    isPercent?: boolean;
}

function MapLabel(props: Props) {
    const {
        className,
        minValue,
        maxValue,
        isPercent,
    } = props;

    return (
        <div className={_cs(className, styles.mapLabel)}>
            <div className={styles.bar} />
            <div className={styles.labelContainer}>
                <div>
                    {isPercent ? '0%' : minValue}
                </div>
                <div>
                    {isPercent ? '100%' : maxValue}
                </div>
            </div>
        </div>
    );
}
export default MapLabel;
