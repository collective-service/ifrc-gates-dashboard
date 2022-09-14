import React, { useMemo } from 'react';
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
import { useQuery, gql } from '@apollo/client';

import PercentageStats from '#components/PercentageStats';
import UncertainityChart from '#components/UncertaintyChart';
import {
    barChartData,
    uncertainData,
} from '#utils/dummyData';
import { getShortMonth } from '#utils/common';
import {
    OutbreakQuery,
    OutbreakQueryVariables,
    TotalOutbreakCasesQuery,
    TotalOutbreakCasesQueryVariables,
} from '#generated/types';

import styles from './styles.css';
import { FilterType } from '../../Filters';

interface PercentageCardGroupProps {
    className?: string;
    filterValues?: FilterType | undefined;
    uncertaintyChartActive: boolean;
}

const TOTAL_OUTBREAK_CASES = gql`
    query TotalOutbreakCases(
        $contextIndicatorId: String,
        $emergency: String,
        $isGlobal: Boolean,
        $mostRecent: Boolean,
        $region: String
    ) {
        epiDataGlobal(
            filters: {
                contextIndicatorId: $contextIndicatorId,
                emergency: $emergency,
                isGlobal: $isGlobal,
                mostRecent: $mostRecent,
                region: $region
            }
        ) {
            contextIndicatorValue
            emergency
        }
    }

`;

const OUTBREAK = gql`
    query Outbreak(
        $isTwelveMonth: Boolean,
        $emergency: String,
        $isGlobal: Boolean,
        $contextIndicatorId: String,
        $region: String,
    ) {
        epiDataGlobal(
            filters: {
                isTwelveMonth: $isTwelveMonth,
                isGlobal: $isGlobal,
                emergency: $emergency,
                contextIndicatorId: $contextIndicatorId,
                region: $region,
            }
        ) {
            id
            contextIndicatorValue
            contextDate
            emergency
        }
    }
`;

function PercentageCardGroup(props: PercentageCardGroupProps) {
    const {
        className,
        uncertaintyChartActive,
        filterValues,
    } = props;

    const totalOutbreakCasesVariables = useMemo((): TotalOutbreakCasesQueryVariables => ({
        contextIndicatorId: 'total_cases',
        mostRecent: true,
        isGlobal: !filterValues?.region,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues?.outbreak,
        filterValues?.region,
    ]);

    const {
        data: totalOutbreakCasesResponse,
    } = useQuery<TotalOutbreakCasesQuery, TotalOutbreakCasesQueryVariables>(
        TOTAL_OUTBREAK_CASES,
        {
            variables: totalOutbreakCasesVariables,
        },
    );

    const outbreakVariables = useMemo((): OutbreakQueryVariables => ({
        contextIndicatorId: 'total_cases',
        isTwelveMonth: true,
        isGlobal: !filterValues?.region,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues?.outbreak,
        filterValues?.region,
    ]);

    const {
        data: outbreakResponse,
    } = useQuery<OutbreakQuery, OutbreakQueryVariables>(
        OUTBREAK,
        {
            variables: outbreakVariables,
        },
    );

    const outbreakLineChart = useMemo(() => (
        outbreakResponse?.epiDataGlobal.map((outbreak) => (
            {
                id: outbreak.id,
                emergency: outbreak.emergency,
                contextDate: getShortMonth(outbreak.contextDate),
                [outbreak.emergency]: outbreak.contextIndicatorValue,
            }
        ))
    ), [outbreakResponse?.epiDataGlobal]);

    const totalCase = totalOutbreakCasesResponse?.epiDataGlobal
        .find(
            (emergency) => emergency.emergency === filterValues?.outbreak,
        );

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <PercentageStats
                className={styles.globalStatCard}
                heading={totalCase?.emergency}
                headingSize="extraSmall"
                headerDescription={(
                    <p>
                        All Outbreak numbers:
                    </p>
                )}
                statValue={totalCase?.contextIndicatorValue ?? 0}
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
                                data={outbreakLineChart}
                                margin={{
                                    right: 20,
                                }}
                            >
                                <XAxis
                                    dataKey="contextDate"
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
                                    dataKey={filterValues?.outbreak}
                                    stroke="#4bda8a"
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
