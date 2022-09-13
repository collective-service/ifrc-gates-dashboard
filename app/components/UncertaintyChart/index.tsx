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
import styles from './styles.css';

export interface UncertainData {
    indicatorValue?: string | null;
    date: string;
    uncertainRange: string[];
}

interface Props {
    className?: string;
    uncertainData: UncertainData[] | undefined;
}

function UncertaintyChart(props: Props) {
    const {
        className,
        uncertainData,
    } = props;

    return (
        <ContainerCard
            className={_cs(className, styles.areaChart)}
            contentClassName={styles.responsiveContent}
            heading="Uncertainty cases"
            headingSize="extraSmall"
            headerDescription="Loreum epsum epsum 2022"
        >
            <ResponsiveContainer
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
                    />
                    <YAxis
                        label={{
                            value: 'Country Trend on (%)',
                            angle: -90,
                            position: 'insideBottomLeft',
                            offset: 16,
                        }}
                        domain={[0, 100]}
                    />
                    <Area
                        dataKey="uncertainRange"
                        stroke="#8DD2B1"
                        fill="#8DD2B1"
                    />
                    <Line
                        dataKey="indicatorValue"
                        stroke="#2F9C67"
                        strokeWidth={2}
                        dot={{
                            stroke: '#2F9C67',
                            strokeWidth: 2,
                        }}
                    />
                    <Tooltip />
                </ComposedChart>
            </ResponsiveContainer>
        </ContainerCard>
    );
}
export default UncertaintyChart;
