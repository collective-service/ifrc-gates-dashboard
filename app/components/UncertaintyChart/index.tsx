import React from 'react';
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
import { isNotDefined, _cs } from '@togglecorp/fujs';

import { FormatType, getShortMonth, normalFormatter } from '#utils/common';
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
}

interface Props {
    className?: string;
    uncertainData: UncertainData[] | undefined;
    emergencyFilterValue?: string;
    headingDescription?: React.ReactNode;
    heading?: React.ReactNode;
    loading?: boolean;
}

interface Payload {
    name?: string;
    value?: number;
    payload?: UncertainData;
}

interface TooltipProps {
    active?: boolean;
    payload?: Payload[];
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

const dateTickFormatter = (d: string) => getShortMonth(d);
const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

function UncertaintyChart(props: Props) {
    const {
        className,
        uncertainData,
        emergencyFilterValue,
        headingDescription,
        heading,
        loading,
    } = props;

    const custom = (tooltipProps: TooltipProps) => {
        const {
            active,
            payload: data,
        } = tooltipProps;
        if (!active || isNotDefined(data) || data.length < 1) {
            return null;
        }
        return (
            <CustomTooltip
                format={data[0].payload?.format ?? 'raw'}
                heading={data[0].payload?.indicatorName ?? ''}
                subHeadingLabel={data[0].payload?.region}
                subHeading={`(${data[0].payload?.date})`}
                value={data[0].payload?.tooltipValue}
                minValue={data[0].payload?.minimumValue}
                maxValue={data[0].payload?.maximumValue}
            />
        );
    };

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
                data={uncertainData}
                loading={loading}
                className={styles.responsiveContainer}
            >
                <ComposedChart
                    data={uncertainData}
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
                        dataKey="indicatorValue"
                        name={emergencyFilterValue}
                        stroke="#2F9C67"
                        strokeWidth={2}
                        dot={<CustomDots />}
                    />
                    <Tooltip content={custom} />
                </ComposedChart>
            </ChartContainer>
        </ContainerCard>
    );
}
export default UncertaintyChart;
