import React from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    formatNumber,
    FormatType,
} from '../../utils/common';

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
    } = props;

    const uncertaintyRange = format === 'percent'
        ? ` [${minValue}% - ${maxValue}%]`
        : ` [${formatNumber(format, minValue)} - ${formatNumber(format, maxValue)}]`;

    const calculatedTotal = customTooltipData?.reduce(
        (acc, obj) => (acc + (obj?.contextIndicatorValue ?? 1)), 0,
    ) ?? 1;

    return (
        <div className={styles.tooltipCard}>
            {heading && (
                <div className={styles.tooltipHeading}>
                    {heading}
                </div>
            )}
            <div className={styles.tooltipContent}>
                {isDefined(subHeadingLabel)
                    ? `${subHeadingLabel} - `
                    : null}
                {subHeading}
            </div>
            {customTooltipData ? (
                customTooltipData?.map((item) => (
                    <div className={styles.tooltipContent}>
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
            ) : (
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
            )}
        </div>
    );
}

export default CustomTooltip;
