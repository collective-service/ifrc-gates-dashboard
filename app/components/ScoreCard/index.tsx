import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Tooltip,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    title: string;
    value?: number;
    date?: string;
    source?: string;
    indicator?: 'red' | 'yellow' | 'orange' | 'green';
}

function ScoreCard(props: Props) {
    const {
        className,
        title,
        value,
        date,
        source,
        indicator,
    } = props;

    return (
        <div className={_cs(
            className,
            styles.readinessContainer,
            indicator === 'green' && styles.green,
            indicator === 'yellow' && styles.yellow,
            indicator === 'orange' && styles.orange,
            indicator === 'red' && styles.red,
            !indicator && styles.noData,
        )}
        >
            <div className={styles.readinessTitle}>{title}</div>
            <div className={_cs(
                styles.readinessValue,
            )}
            >
                {(value ? `${Math.round(value)}%` : 'N/A')}
            </div>

            {(date || source) && (
                <Tooltip trackMousePosition>
                    {source && `${source}`}
                    {date && ` - ${date}`}
                </Tooltip>
            )}
        </div>
    );
}

export default ScoreCard;
