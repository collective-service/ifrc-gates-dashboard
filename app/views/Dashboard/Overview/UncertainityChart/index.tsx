import React from 'react';
import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Line,
    ResponsiveContainer,
} from 'recharts';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import { rangeData } from '#utils/dummyData';
import styles from './styles.css';

interface UncertainityChartProps {
    className?: string;
}

function UncertainityChart(props: UncertainityChartProps) {
    const { className } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.areaChart)}
            contentClassName={styles.responsiveContent}
            heading="Total number of cases"
            headingSize="extraSmall"
            headerDescription="Loreum epsum epsum 2022"
        >
            <ResponsiveContainer
                className={styles.responsiveContainer}
                width={700}
                height={250}
            >
                <ComposedChart
                    data={rangeData}
                >
                    <XAxis
                        dataKey="date"
                        padding={{
                            left: 40,
                            right: 40,
                        }}
                    />
                    <YAxis hide />
                    <Area
                        dataKey="temperature"
                        stroke="#8884d8"
                        fill="#8884d8"
                    />
                    <Line
                        dataKey="amt"
                        stroke="#ff7300"
                    />
                    <Tooltip />
                </ComposedChart>
            </ResponsiveContainer>
        </ContainerCard>
    );
}
export default UncertainityChart;
