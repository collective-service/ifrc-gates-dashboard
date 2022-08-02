import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    Pie,
    PieChart,
    Cell,
} from 'recharts';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import {
    totalCasesBarChart,
    regionalBreakdownPieData,
} from '#utils/dummyData';

import styles from './styles.css';

const COLORS = ['#4D6F8B', '#AED8F1', '#7FAEDA', '#D0EFF2', '#B5CFD1'];
interface PercentageCardGroupProps {
    className?: string;
}

function MultipleBreakdownCardGroup(props: PercentageCardGroupProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <ContainerCard
                className={_cs(styles.globalStatCard)}
                contentClassName={styles.responsiveContent}
                heading="Total number of cases"
                headingSize="extraSmall"
                headerDescription="Loreum epsum epsum 2020"
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    <BarChart
                        data={totalCasesBarChart}
                        barSize={45}
                    >
                        <Tooltip
                            allowEscapeViewBox={{
                                x: true,
                                y: true,
                            }}
                        />
                        <XAxis dataKey="name" tickLine={false} axisLine={false}>
                            <LabelList dataKey="name" position="bottom" />
                        </XAxis>
                        <Bar dataKey="amt" fill="#7FAEDA">
                            <LabelList dataKey="range" position="top" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ContainerCard>
            <ContainerCard
                className={_cs(styles.regionsPieChart)}
                contentClassName={styles.responsiveContent}
                heading="Regional Breakdown"
                headingSize="extraSmall"
                headerDescription="Loreum Ipsum epsum sandiego"
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    <PieChart>
                        <Pie
                            data={regionalBreakdownPieData}
                            dataKey="percentage"
                            labelLine={false}
                            cx={100}
                            cy={100}
                            outerRadius={50}
                        >
                            {regionalBreakdownPieData.map((entry) => (
                                <Cell
                                    key={`Cell -${entry.id}`}
                                    fill={COLORS[entry.id % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </ContainerCard>
        </div>
    );
}
export default MultipleBreakdownCardGroup;
