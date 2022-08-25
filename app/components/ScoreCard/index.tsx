import React from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.css';

interface Props {
    className?: string;
    title: string;
    value?: number;
    indicator?: 'red' | 'yellow' | 'orange' | 'green' | undefined;
}

function ScoreCard(props: Props) {
    const {
        className,
        title,
        value,
        indicator,
    } = props;

    if (!value) {
        return null;
    }

    return (
        <div className={_cs(
            className,
            styles.readinessContainer,
            indicator === 'green' && styles.green,
            indicator === 'yellow' && styles.yellow,
            indicator === 'orange' && styles.orange,
            indicator === 'red' && styles.red,
        )}
        >
            <div className={styles.readinessTitle}>{title}</div>
            <div className={_cs(
                styles.readinessValue,
            )}
            >
                {(value ? `${value}%` : 'N/A')}
            </div>
        </div>
    );
}

export default ScoreCard;
