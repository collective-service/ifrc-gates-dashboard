import React, { useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    Cell,
} from 'recharts';
import {
    ContainerCard,
    ListView,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import {
    totalCasesBarChart,
    regionalBreakdownPieData,

} from '#utils/dummyData';

import PieChartInfo, { RegionalDataType } from './PieChartInfo';
import styles from './styles.css';

const COLORS = ['#4D6F8B', '#AED8F1', '#B5CFD1', '#7FAEDA', '#D0EFF2'];
const pieChartInfoKeySelector = (d: PieChartInfoRendererProps) => d.regionId;
const breakdownLabelKeySelector = (d: RegionalBreakdownLabelProps) => d.regionId;
export interface PieChartInfoRendererProps {
    regionId: string;
    country?: string;
    color?: string;
    regionalData?: RegionalDataType[];
}
export interface RegionalBreakdownLabelProps {
    regionId: string;
    outbreak?: string;
    color?: string;
}

function RegionalBreakdownLabel(props: RegionalBreakdownLabelProps) {
    const {
        regionId,
        outbreak,
        color,
    } = props;

    return (
        <div
            className={styles.breakdownLabelWrapper}
            key={regionId}
        >
            <div
                style={{
                    backgroundColor: color,
                    width: 10,
                    height: 10,
                    borderRadius: 50,
                }}
            />
            <div className={styles.labelName}>
                {outbreak}
            </div>
        </div>
    );
}

interface RegionalBreakdownCardProps {
    className?: string;
}

function RegionalBreakdownCard(props: RegionalBreakdownCardProps) {
    const {
        className,
    } = props;

    const pieChartInfoRendererParams = useCallback(
        (_: string, data: PieChartInfoRendererProps) => ({
            country: data.country,
            regionalData: data?.regionalData,
        }), [],
    );

    const regionalBreakdownLabelParams = useCallback(
        (_: string, data: RegionalBreakdownLabelProps) => ({
            regionId: data.regionId,
            color: data.color,
            outbreak: data.outbreak,
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
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                        >
                            <LabelList
                                dataKey="name"
                                position="bottom"
                                fontSize="10"
                            />
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
                headerDescription="Loreum Ipsum epsum san-diego"
            >
                <ListView
                    className={styles.pieChartCollection}
                    keySelector={pieChartInfoKeySelector}
                    data={regionalBreakdownPieData}
                    renderer={PieChartInfo}
                    rendererParams={pieChartInfoRendererParams}
                    filtered={false}
                    errored={false}
                    pending={false}
                />
                <ListView
                    className={styles.breakdownLabel}
                    keySelector={breakdownLabelKeySelector}
                    data={regionalBreakdownPieData}
                    renderer={RegionalBreakdownLabel}
                    rendererParams={regionalBreakdownLabelParams}
                    filtered={false}
                    errored={false}
                    pending={false}
                />
            </ContainerCard>
        </div>
    );
}
export default RegionalBreakdownCard;
