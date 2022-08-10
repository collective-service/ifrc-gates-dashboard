import React from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.css';

export interface Props {
    className?: string;
    title?: string | undefined;
    value?: number;
}

function ReadinessCard(props: Props) {
    const {
        className,
        title,
        value,
    } = props;
    return (
        <div className={_cs(className, styles.readinessContainer)}>
            <div className={styles.readinessTitle}>{title}</div>
            <div className={styles.readinessValue}>{value}</div>
        </div>
    );
}

export default ReadinessCard;
