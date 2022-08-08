import React from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from 'recharts';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import PercentageStats from '#components/PercentageStats';
import {
    lineChartData,
    barChartData,
} from '#utils/dummyData';

import styles from './styles.css';

interface PercentageCardGroupProps {
    className?: string;
}

function PercentageCardGroup(props: PercentageCardGroupProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <PercentageStats
                className={styles.globalStatCard}
                heading="Total number of cases"
                headingSize="extraSmall"
                headerDescription={(
                    <p>
                        All Outbreak numbers:
                    </p>
                )}
                statValue={600}
                suffix="M"
            />
            <ContainerCard
                className={styles.trendsCard}
                heading="Outbreak over last 12 months"
                headingSize="extraSmall"
                contentClassName={styles.responsiveContent}
                headerDescription="Average indicator value weighted by country's populations"
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    <LineChart
                        data={lineChartData}
                        margin={{
                            right: 20,
                        }}
                    >
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            padding={{ top: 30 }}
                        />
                        <Tooltip
                            allowEscapeViewBox={{
                                x: true,
                                y: true,
                            }}
                        />
                        <Legend
                            iconType="square"
                            align="right"
                        />
                        <Line
                            type="monotone"
                            dataKey="MonkeyPox"
                            stroke="#4bda8a"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="Covid"
                            stroke="#2169bb"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="Ebola"
                            stroke="#ba2123"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ContainerCard>
            <ContainerCard
                className={styles.regionsCard}
                contentClassName={styles.responsiveContent}
                heading="Regional Breakdown"
                headingSize="extraSmall"
                headerDescription="Average indicator value weighted by country's populations (Apr 2022)"
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    <BarChart
                        data={barChartData}
                        barSize={45}
                    >
                        <Tooltip
                            allowEscapeViewBox={{
                                x: true,
                                y: true,
                            }}
                        />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                        >
                            <LabelList
                                dataKey="name"
                                position="bottom"
                            />
                        </XAxis>
                        <Bar
                            dataKey="amt"
                            fill="#2F9C67"
                        >
                            <LabelList
                                dataKey="range"
                                position="top"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ContainerCard>
        </div>
    );
}
export default PercentageCardGroup;
