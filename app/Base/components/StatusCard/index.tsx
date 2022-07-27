import React from 'react';
import { NumberOutput } from '@the-deep/deep-ui';

import styles from './styles.css';

export interface statusCardProps {
    statusId: number;
    title: string;
    value: number;
    regionalValue: number;
}

function StatusCard(props: statusCardProps) {
    const {
        statusId,
        title,
        value,
        regionalValue,
    } = props;

    return (
        <div key={statusId} className={styles.statusCard}>
            <div className={styles.titleAndValue}>
                <div className={styles.title}>{title}</div>
                <NumberOutput
                    className={styles.value}
                    value={value}
                />
            </div>
            <div className={styles.label}>
                {`[regionalValue-${regionalValue}M]`}
            </div>
        </div>
    );
}

export default StatusCard;
