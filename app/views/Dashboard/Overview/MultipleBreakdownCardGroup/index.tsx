import React, { useCallback } from 'react';
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
    List,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import {
    totalCasesBarChart,
    regionalBreakdownPieData,
} from '#utils/dummyData';

import PieChartInfo, { RegionalDataType } from './PieChartInfo';
import styles from './styles.css';

const COLORS = ['#4D6F8B', '#AED8F1', '#B5CFD1', '#7FAEDA', '#D0EFF2'];
const pieChartInfoKeySelector = (d: PieChartInfoRendererProps) => d.id;
export interface PieChartInfoRendererProps {
    id: string;
    country?: string;
    color?: string;
    regionalData?: RegionalDataType[];
}
interface BreakdownCardGroupProps {
    className?: string;
}

function RegionalBreakdownLabel() {
    return (
        <div className={styles.breakdownLabelWrapper}>
            <div className={styles.labelColor}>
                ColorHere
            </div>
            <div className={styles.labelName}>
                Label-Name-Here
            </div>
        </div>
    );
}

function MultipleBreakdownCardGroup(props: BreakdownCardGroupProps) {
    const {
        className,
    } = props;

    const pieChartInfoRendererParams = useCallback(
        (_: string, data: PieChartInfoRendererProps) => ({
            id: data.id,
            regionalData: data?.regionalData,
        }), [],
    );

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
                            isAnimationActive={false}
                            allowEscapeViewBox={{
                                x: false,
                                y: false,
                            }}
                        />
                        <XAxis dataKey="name" tickLine={false} axisLine={false}>
                            <LabelList dataKey="name" position="bottom" fontSize="10" />
                        </XAxis>
                        <Bar
                            dataKey="amt"
                            isAnimationActive={false}
                        >
                            {totalCasesBarChart?.map((entry) => (
                                <Cell
                                    key={`Cell -${entry.id}`}
                                    fill={COLORS[entry.id % COLORS.length]}
                                />
                            ))}
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
                <div className={styles.pieChartCollection}>
                    <List
                        keySelector={pieChartInfoKeySelector}
                        data={regionalBreakdownPieData}
                        renderer={PieChartInfo}
                        rendererParams={pieChartInfoRendererParams}
                    />
                </div>
                {/* <div className={styles.breakDownLabel}>
                    <List
                        keySelector={pieChartInfoKeySelector}
                        data={null}
                        renderer={RegionalBreakdownLabel}
                        rendererParams={null}
                    />
                </div> */}
            </ContainerCard>
        </div>
    );
}
export default MultipleBreakdownCardGroup;
