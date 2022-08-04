import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { NumberOutput } from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight: number;
    suffix?: string;
    progressInfoData: {
        title: string;
        id: string;
        country: number;
        regional: number;
        totalValue: number;
    };
}

function MultiDataProgressBar(props: Props) {
    const {
        className,
        barHeight,
        progressInfoData,
        suffix,
    } = props;

    const countryPercentage = useMemo(
        () => (
            ((progressInfoData.country / progressInfoData.totalValue) * 100).toFixed(0)
        ), [progressInfoData],
    );

    const regionalPercentage = useMemo(
        () => (
            ((progressInfoData.regional / progressInfoData.totalValue) * 100).toFixed(0)
        ), [progressInfoData],
    );

    const barTooltip = (progressInfoData?.country
        && progressInfoData?.regional
        && progressInfoData?.totalValue)
        ? (`Country: ${progressInfoData.country ?? '0'}, Regional: ${progressInfoData.regional ?? '0'}`
        ) : '';

    return (
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressTitle}>
                {progressInfoData.title}
                <div className={styles.progressValue}>
                    <NumberOutput
                        value={Number(countryPercentage)}
                        suffix={suffix}
                    />
                    <div className={styles.regionalText}>
                        {`[regional- ${regionalPercentage}${suffix}]`}
                    </div>
                </div>
            </div>
            <div
                className={_cs(styles.progressBarWrapper, className)}
                style={{ height: `${barHeight}px` }}
                title={barTooltip}
            >
                <div className={styles.progressBarValue}>
                    <div
                        className={styles.progressBarStyle}
                        key={progressInfoData.id}
                        style={{
                            width: `${countryPercentage}%`,
                            backgroundColor: 'var(--color-progress-bar)',
                        }}
                    />
                </div>
                <div className={styles.progressBarValue}>
                    <div
                        className={styles.progressBarStyle}
                        key={progressInfoData.id}
                        style={{
                            width: `${regionalPercentage}%`,
                            backgroundColor: 'var(--color-text-regional)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default MultiDataProgressBar;
