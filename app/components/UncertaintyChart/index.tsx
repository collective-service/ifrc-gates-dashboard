import React, { useMemo } from 'react';
import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Line,
} from 'recharts';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    isDefined,
    isNotDefined,
    _cs,
} from '@togglecorp/fujs';
import {
    FormatType,
    getShortMonth,
    normalFormatter,
    min,
    max,
} from '#utils/common';
import CustomTooltip from '#components/CustomTooltip';
import ChartContainer from '#components/ChartContainer';

import styles from './styles.css';

export interface UncertainData {
    emergency?: string;
    indicatorValue?: number | null;
    tooltipValue?: number | null
    date: string;
    uncertainRange?: (number | undefined)[];
    minimumValue?: number;
    maximumValue?: number;
    region?: string;
    indicatorName?: string | null;
    format?: FormatType;
    subvariable?: string;
    interpolated?: number | null | undefined;
}

interface Payload {
    name?: string;
    value?: number;
    payload?: UncertainData;
}

interface CustomDotsProps {
    cx?: number;
    cy?: number;
    r?: number;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    payload?: {
        interpolated?: number;
    };
}
function CustomDots(dotsProps: CustomDotsProps) {
    const {
        cx,
        cy,
        r,
        stroke,
        payload,
        strokeWidth,
        fill,
    } = dotsProps;
    if (payload?.interpolated) {
        return null;
    }
    return (
        <circle
            strokeWidth={strokeWidth}
            stroke={stroke}
            fill={fill}
            cx={cx}
            cy={cy}
            r={r}
        />
    );
}

interface TooltipProps {
    active?: boolean;
    payload?: Payload[];
}
function TooltipContent(props: TooltipProps) {
    const {
        active,
        payload: data,
    } = props;
    if (!active || isNotDefined(data) || data.length < 1) {
        return null;
    }
    const { payload } = data[0];

    return (
        <CustomTooltip
            format={payload?.format ?? 'raw'}
            heading={payload?.indicatorName ?? ''}
            subHeadingLabel={payload?.region}
            subHeading={payload?.date ? `(${payload.date})` : undefined}
            subvariable={payload?.subvariable}
            value={payload?.tooltipValue}
            minValue={payload?.minimumValue}
            maxValue={payload?.maximumValue}
        />
    );
}

const dateTickFormatter = (d: string) => getShortMonth(d);
const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

interface Props {
    className?: string;
    uncertainData: UncertainData[] | undefined;
    emergencyFilterValue?: string;
    headingDescription?: React.ReactNode;
    heading?: React.ReactNode;
    loading?: boolean;
}

function UncertaintyChart(props: Props) {
    const {
        className,
        uncertainData,
        emergencyFilterValue,
        headingDescription,
        heading,
        loading,
    } = props;

    const valueRange = uncertainData?.filter((item) => item.interpolated === 0);
    const maxValue = max(valueRange, (val) => new Date(val.date).getTime());
    const minValue = min(valueRange, (val) => new Date(val.date).getTime());

    const uncertainDataFiltered = useMemo(() => uncertainData?.map((item) => {
        let nonInterpolatedValue = null;
        let interpolatedValue = null;

        if (
            item.date === maxValue?.date
            || item.date === minValue?.date
        ) {
            nonInterpolatedValue = item.indicatorValue;
            interpolatedValue = item.indicatorValue;
        } else if (
            isDefined(maxValue)
            && item.date < maxValue?.date
            && isDefined(minValue)
            && item.date > minValue?.date
        ) {
            nonInterpolatedValue = item.indicatorValue;
            interpolatedValue = null;
        } else {
            interpolatedValue = item.indicatorValue;
            nonInterpolatedValue = null;
        }
        return {
            ...item,
            nonInterpolatedValue,
            interpolatedValue,
        };
    }), [
        maxValue,
        minValue,
        uncertainData,
    ]);

    return (
        <ContainerCard
            className={_cs(className, styles.areaChart)}
            contentClassName={styles.responsiveContent}
            headingClassName={styles.headingContent}
            heading={heading}
            headingSize="extraSmall"
            headerDescription={headingDescription}
        >
            <ChartContainer
                data={uncertainDataFiltered}
                loading={loading}
                className={styles.responsiveContainer}
            >
                <ComposedChart
                    data={uncertainDataFiltered}
                >
                    <XAxis
                        dataKey="date"
                        padding={{
                            right: 30,
                            left: 20,
                        }}
                        tickLine={false}
                        fontSize={12}
                        interval={0}
                        angle={-30}
                        tickFormatter={dateTickFormatter}
                        tickMargin={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        fontSize={12}
                        tickFormatter={normalizedTickFormatter}
                    />
                    <Area
                        dataKey="uncertainRange"
                        name="Uncertainty Range"
                        stroke="#8DD2B1"
                        fill="#8DD2B1"
                    />
                    <Line
                        dataKey="nonInterpolatedValue"
                        name={emergencyFilterValue}
                        stroke="#2F9C67"
                        strokeWidth={2}
                        dot={<CustomDots />}
                    />
                    <Line
                        dataKey="interpolatedValue"
                        stroke="#2F9C67"
                        strokeWidth={2}
                        strokeDasharray="2 2"
                        dot={false}
                    />
                    <Tooltip content={TooltipContent} />
                </ComposedChart>
            </ChartContainer>
        </ContainerCard>
    );
}
export default UncertaintyChart;
