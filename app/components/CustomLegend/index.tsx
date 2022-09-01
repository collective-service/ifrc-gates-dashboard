import React from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.css';

export interface Props {
    className?: string;
    age?: string
    genders?: string;
    fill: string;
}

function CustomLegend(props: Props) {
    const {
        className,
        age,
        genders,
        fill,
    } = props;
    return (
        <div
            className={_cs(className, styles.legendList)}
        >
            <div
                className={styles.legendBox}
                style={{ backgroundColor: fill }}
            />
            <div className={styles.legendDetails}>
                {age
                    && <div>{age}</div>}
                {genders
                    && <div>{genders}</div>}
                {/* FIX ME: Add regional data */}
                <div className={styles.regionalText}>
                    Regional 30%
                </div>
            </div>
        </div>
    );
}

export default CustomLegend;
