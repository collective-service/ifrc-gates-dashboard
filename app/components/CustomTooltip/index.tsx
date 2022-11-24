import React, { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    formatNumber,
    FormatType,
    negativeToZero,
    positiveToZero,
} from '#utils/common';

import styles from './styles.css';

type RegionalDataType = {
    fill: string;
    emergency: string;
    contextIndicatorValue?: number | null;
    format?: FormatType;
    region?: string;
    contextDate?: string;
}

interface Props {
    format: FormatType;
    heading?: string;
    subHeading?: string;
    subHeadingLabel?: string;
    subvariable?: string;
    value?: number | null | undefined;
    valueLabel?: string;
    minValue?: number;
    maxValue?: number;
    customTooltipData?: RegionalDataType[];
}

function CustomTooltip(props: Props) {
    const {
        format,
        heading,
        subHeading,
        subHeadingLabel,
        valueLabel,
        value,
        minValue,
        maxValue,
        customTooltipData,
        subvariable,
    } = props;

    const uncertaintyRange = useMemo(() => (
        format === 'percent'
            ? `[${negativeToZero(minValue, null)}% - ${positiveToZero(maxValue, null)}%]`
            : `[${formatNumber(format, minValue)} - ${formatNumber(format, maxValue)}]`
    ), [
        minValue,
        maxValue,
        format,
    ]);

    const calculatedTotal = useMemo(() => (
        customTooltipData?.reduce(
            (acc, obj) => (acc + (obj?.contextIndicatorValue ?? 1)), 0,
        )
    ), [
        customTooltipData,
    ]);

    const tooltipRender = useMemo(() => {
        if (customTooltipData) {
            return (
                customTooltipData?.map((item) => (
                    <div
                        key={`${item.emergency}-${item.region}-${item.contextDate}`}
                        className={styles.tooltipContent}
                    >
                        {isDefined(item.emergency) && `${item.emergency} - `}
                        {(isDefined(item.contextIndicatorValue)
                            && item.contextIndicatorValue !== null)
                            && (`${formatNumber(
                                'raw',
                                item.contextIndicatorValue,
                            )} (${formatNumber(
                                'percent',
                                item.contextIndicatorValue,
                                calculatedTotal,
                            )})`)}
                        {(isDefined(minValue) && isDefined(maxValue))
                            ? uncertaintyRange
                            : null}
                    </div>
                ))
            );
        }
        return (
            <div className={styles.tooltipContent}>
                {isDefined(valueLabel) && `${valueLabel} : `}
                {(isDefined(value) && value !== null) && formatNumber(
                    format === 'million' ? 'raw' : format,
                    value,
                )}
                {(isDefined(minValue) && isDefined(maxValue))
                    ? uncertaintyRange
                    : null}
            </div>
        );
    }, [
        customTooltipData,
        calculatedTotal,
        uncertaintyRange,
        minValue,
        maxValue,
        valueLabel,
        format,
        value,
    ]);

    return (
        <div className={styles.tooltipCard}>
            {heading && (
                <div className={styles.tooltipHeading}>
                    {heading}
                </div>
            )}
            {subvariable && (
                <div className={styles.tooltipContent}>
                    {subvariable}
                </div>
            )}
            <div className={styles.tooltipContent}>
                {isDefined(subHeadingLabel)
                    ? `${subHeadingLabel} - `
                    : null}
                {subHeading}
            </div>
            {tooltipRender}
        </div>
    );
}

export default CustomTooltip;
