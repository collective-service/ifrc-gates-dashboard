import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight?: number;
}

function MapLabel(props: Props) {
    const {
        className,
        barHeight = 10,
    } = props;

    const valueTooltip = '0';

    return (
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressValueWrapper}>
                <div
                    className={styles.progressBarWrapper}
                    style={{ height: `${barHeight}px` }}
                    title={valueTooltip as string}
                />
            </div>
        </div>
    );
}
export default MapLabel;
