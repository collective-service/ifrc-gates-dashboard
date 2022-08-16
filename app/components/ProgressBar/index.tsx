import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoInformationCircleOutline } from 'react-icons/io5';

import styles from './styles.css';

export interface Props {
    className?: string | undefined;
    barHeight: number;
    suffix?: string;
    progressData: {
        barName: string | undefined,
        id: string,
        title: string | undefined,
        color?: string | undefined,
        value: number | undefined,
        regional?: number | undefined,
        totalValue: number | undefined,
    };
}

function ProgressBar(props: Props) {
    const {
        className,
        barHeight,
        progressData,
        suffix,
    } = props;

    const avgResult = useMemo(
        () => ({
            percentage: progressData?.value && progressData?.totalValue
                && (((progressData.value / progressData.totalValue) * 100).toFixed(1)
                    ?? undefined),
            regionalPercentage: progressData.regional && progressData?.totalValue
                && (((progressData.regional / progressData.totalValue) * 100).toFixed(1)
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
        <div className={_cs(className, styles.progressInfo)}>
            <div className={styles.progressTitle}>
                {progressData.barName}
                <IoInformationCircleOutline />
            </div>
            <div className={styles.progressValueWrapper}>
                <div
                    className={styles.progressBarWrapper}
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
                    {suffix}
                </div>
            </div>
            {avgResult.regionalPercentage && (
                <div className={styles.regionalValue}>
                    {`Regional ${avgResult.regionalPercentage}${suffix}`}
                </div>
            )}
        </div>
    );
}
export default ProgressBar;
