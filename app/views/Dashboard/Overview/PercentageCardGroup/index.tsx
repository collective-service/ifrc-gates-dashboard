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
import UncertainityChart from '#components/UncertaintyChart';
import {
    lineChartData,
    barChartData,
    uncertainData,
} from '#utils/dummyData';

import styles from './styles.css';

interface PercentageCardGroupProps {
    className?: string;
    uncertaintyChartActive: boolean;
}

function PercentageCardGroup(props: PercentageCardGroupProps) {
    const {
        className,
        uncertaintyChartActive,
    } = props;

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <PercentageStats
                className={styles.globalStatCard}
                headingSize="extraSmall"
                headerDescription={(
                    <p>
                        All Outbreak numbers:
                    </p>
                )}
                statValue={90}
                suffix={(uncertaintyChartActive ? '%' : 'M')}
            />
            { /* FIXME: (for Priyesh) Either include data in Uncertainty Chart
                or remove the component altogether
               */}
            {uncertaintyChartActive
                ? (
                    <UncertainityChart
                        uncertainData={uncertainData}
                    />
                ) : (
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
                                    padding={{ left: 20 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    padding={{ top: 12 }}
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
                )}

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
                        barSize={18}
                    >
                        <Tooltip
                            allowEscapeViewBox={{
                                x: true,
                                y: true,
                            }}
                            cursor={false}
                        />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            fontSize="14"
                        >
                            <LabelList
                                dataKey="name"
                                position="bottom"
                            />
                        </XAxis>
                        <YAxis
                            padding={{ bottom: 12 }}
                            hide
                        />
                        <Bar
                            dataKey="amt"
                            fill="#8DD2B1"
                            radius={[10, 10, 0, 0]}
                        >
                            <LabelList
                                dataKey="range"
                                position="insideBottomLeft"
                                fill="#8DD2B1"
                                angle={-90}
                                offset={-2.8}
                                fontSize={22}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ContainerCard>
        </div>
    );
}
export default PercentageCardGroup;
