import React from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    formatNumber,
    FormatType,
} from '../../utils/common';

import styles from './styles.css';

interface Props {
    format: FormatType;
    heading?: string;
    subHeading?: string;
    subHeadingLabel?: string;
    value?: number | null | undefined;
    valueLabel?: string;
    minValue?: number;
    maxValue?: number;
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
    } = props;

    const uncertaintyRange = format === 'percent'
        ? ` [${minValue}% - ${maxValue}%]`
        : ` [${formatNumber(format, minValue)} - ${formatNumber(format, maxValue)}]`;

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
            <div className={styles.tooltipContent}>
                {isDefined(valueLabel) && `${valueLabel} : `}
                {(isDefined(value) && value !== null) && formatNumber(
                    format ?? 'raw',
                    value,
                )}
                {(isDefined(minValue) && isDefined(maxValue))
                    ? uncertaintyRange
                    : null}
            </div>
        </div>
    );
}

export default CustomTooltip;
