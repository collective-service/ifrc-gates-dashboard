import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight: number;
    progressData: {
        countryName: string | undefined,
        id: string,
        title: string | undefined,
        color?: string | undefined,
        value: number | undefined,
        totalValue: number | undefined,
    };
}

function ProgressBar(props: Props) {
    const {
        className,
        barHeight,
        progressData,
    } = props;

    const avgResult = useMemo(
        () => ({
            percentage: progressData?.value && progressData?.totalValue
                && (((progressData.value / progressData.totalValue) * 100).toFixed(1)
                    ?? undefined),
        }),
        [progressData],
    );

    const tooltip = useMemo(
        () => ((progressData?.value && progressData?.totalValue)
            && ((`${progressData.title}: ${progressData.value ?? '0'}`) ?? undefined)
        ),
        [
            progressData,
        ],
    );

    return (
        <div className={styles.progressInfo}>
            <div>
                {progressData.countryName}
            </div>
            <div className={styles.progressValueWrapper}>
                <div
                    className={_cs(styles.progressBarWrapper, className)}
                    style={{ height: `${barHeight}px` }}
                    title={tooltip as string}
                >
                    <div
                        className={styles.progressBarStyle}
                        key={progressData.id}
                        style={{
                            width: `${avgResult.percentage}%`,
                            backgroundColor: progressData.color ?? 'blue',
                        }}
                    />
                </div>
                <div
                    className={styles.progressValue}
                    title={tooltip as string}
                >
                    {avgResult?.percentage}
                    M
                </div>
            </div>
        </div>
    );
}
export default ProgressBar;
