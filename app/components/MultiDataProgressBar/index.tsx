import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { NumberOutput } from '@the-deep/deep-ui';

import styles from './styles.css';

export interface ProgressBarProps {
    className?: string | undefined;
    barHeight: number;
    suffix?: string;
    progressInfoData: {
        source: string;
        id: string;
        country: number;
        regional: number;
        totalValue: number;
    };
}

function MultiDataProgressBar(props: ProgressBarProps) {
    const {
        className,
        barHeight,
        progressInfoData,
        suffix,
    } = props;

    const avgResult = useMemo(
        () => (
            {
                countryPercentage: (
                    (progressInfoData.country / progressInfoData.totalValue) * 100).toFixed(0),
                regionalPercentage: (
                    (progressInfoData.regional / progressInfoData.totalValue) * 100).toFixed(0),
            }
        ), [progressInfoData],
    );

    const tooltip = useMemo(
        () => ((progressInfoData?.country
            && progressInfoData?.regional
            && progressInfoData?.totalValue
        )
            && ((`Country: ${progressInfoData.country ?? '0'},Regional: ${progressInfoData.regional ?? '0'}
            `) ?? undefined)
        ),
        [
            progressInfoData,
        ],
    );
    return (
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressTitle}>
                {progressInfoData.source}
                <div className={styles.progressValue}>
                    <NumberOutput
                        value={Number(avgResult?.countryPercentage)}
                        suffix={suffix}
                    />
                    <div className={styles.regionalText}>
                        {`[regional- ${avgResult.regionalPercentage}${suffix}]`}
                    </div>
                </div>
            </div>
            <div
                className={_cs(styles.progressBarWrapper, className)}
                style={{ height: `${barHeight}px` }}
                title={tooltip as string}
            >
                <div className={styles.progressBarValue}>
                    <div
                        className={styles.progressBarStyle}
                        key={progressInfoData.id}
                        style={{
                            width: `${avgResult.countryPercentage}%`,
                            backgroundColor: 'var(--color-progress-bar)',
                        }}
                    />
                </div>
                <div className={styles.progressBarValue}>
                    <div
                        className={styles.progressBarStyle}
                        key={progressInfoData.id}
                        style={{
                            width: `${avgResult.regionalPercentage}%`,
                            backgroundColor: 'var(--color-text-regional)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default MultiDataProgressBar;
