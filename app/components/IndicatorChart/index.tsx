import React from 'react';
import { ContainerCard } from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import {
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';

import styles from './styles.css';

type indicatorOverviewType = ({
    id: number;
    month: string;
    percentage: number;
})[]
interface IndicatorChartProps {
    className?: string;
    heading?: React.ReactNode;
    headerDescription?: React.ReactNode;
    headingSize?: 'large' | 'small' | 'extraSmall' | 'medium' | 'extraLarge' | undefined;
    chartData: indicatorOverviewType;
}

function IndicatorChart(props: IndicatorChartProps) {
    const {
        className,
        heading,
        headerDescription,
        headingSize = 'extraSmall',
        chartData,
    } = props;
    return (
        <ContainerCard
            className={_cs(className, styles.indicatorChartCard)}
            heading={heading}
            headerDescription={headerDescription}
            headingSize={headingSize}
            contentClassName={styles.responsiveContainer}
        >
            <ResponsiveContainer className={styles.responsiveContent}>
                <LineChart
                    data={chartData}
                    margin={{
                        left: 0,
                        right: 20,
                    }}
                >
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        padding={{ top: 30 }}
                    />
                    <Legend
                        iconType="rect"
                        align="right"
                        verticalAlign="top"
                    />
                    <Tooltip />
                    <Line
                        type="monotone"
                        stroke="#2F9C67"
                        name="Percentage"
                        strokeWidth={3}
                        dot={false}
                        dataKey="percentage"
                    />
                </LineChart>
            </ResponsiveContainer>
        </ContainerCard>
    );
}

export default IndicatorChart;
