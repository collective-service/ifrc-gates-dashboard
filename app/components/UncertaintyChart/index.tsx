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
import { isDefined, _cs } from '@togglecorp/fujs';

import { formatNumber, FormatType, getShortMonth } from '#utils/common';
import ChartContainer from '#components/ChartContainer';

import styles from './styles.css';

export interface UncertainData {
    emergency?: string;
    indicatorValue?: number | null;
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

const dateTickFormatter = (d: string) => getShortMonth(d);

function UncertaintyChart(props: Props) {
    const {
        className,
        uncertainData,
        emergencyFilterValue,
        headingDescription,
        heading,
        loading,
    } = props;

    const customTooltip = (tooltipProps: TooltipProps) => {
        const {
            active,
            payload: data,
        } = tooltipProps;
        if (active && data && data.length > 0) {
            const format = data[0].payload?.format;
            return (
                <div className={styles.tooltipCard}>
                    <div className={styles.tooltipHeading}>
                        {data[0].payload?.indicatorName}
                    </div>
                    <div className={styles.tooltipContent}>
                        {isDefined(data[0].payload?.region)
                            ? `${data[0].payload?.region} - `
                            : null}
                        {dateTickFormatter(data[0].payload?.date ?? '')}
                    </div>
                    <div className={styles.tooltipContent}>
                        {formatNumber(format as FormatType,
                            data[0].payload?.indicatorValue ?? 0)}
                        {isDefined(data[0].payload?.minimumValue
                            && isDefined(data[0].payload.maximumValue))
                            ? ` [${data[0].payload?.minimumValue} - ${data[0].payload?.maximumValue}] `
                            : null}
                    </div>
                </div>
            );
        }

        return null;
    };

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
                            left: 30,
                            right: 30,
                        }}
                        tickFormatter={dateTickFormatter}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
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
                        dot={{
                            stroke: '#2F9C67',
                            strokeWidth: 2,
                        }}
                    />
                    <Tooltip content={customTooltip} />
                </ComposedChart>
            </ChartContainer>
        </ContainerCard>
    );
}
export default UncertaintyChart;
