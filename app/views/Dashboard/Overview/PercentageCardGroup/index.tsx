import React, { useCallback, useMemo } from 'react';
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
    Cell,
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
} from '#utils/dummyData';
import { decimalToPercentage, getShortMonth } from '#utils/common';
import {
    OutbreakQuery,
    OutbreakQueryVariables,
    TotalOutbreakCasesQuery,
    TotalOutbreakCasesQueryVariables,
    RegionalBreakdownQuery,
    RegionalBreakdownQueryVariables,
    UncertaintyGlobalQuery,
    UncertaintyGlobalQueryVariables,
    UncertaintyRegionQuery,
    UncertaintyRegionQueryVariables,
} from '#generated/types';

import styles from './styles.css';
import { FilterType } from '../../Filters';

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

const REGIONAL_BREAKDOWN = gql`
    query RegionalBreakdown(
        $isTwelveMonth: Boolean,
        $emergency: String,
        $isGlobal: Boolean,
        $contextIndicatorId: String,
        $region: String,
        $mostRecent: Boolean,
    ) {
        epiDataGlobal(
        filters: {
            isTwelveMonth: $isTwelveMonth,
            isGlobal: $isGlobal,
            emergency: $emergency,
            contextIndicatorId: $contextIndicatorId,
            region: $region,
            mostRecent: $mostRecent,
        }
        ) {
            id
            contextIndicatorValue
            mostRecent
            emergency
            contextDate
            region
        }
    }
`;

interface PercentageCardGroupProps {
    className?: string;
    filterValues?: FilterType | undefined;
    uncertaintyChartActive: boolean;
}
const UNCERTAINTY = gql`
    query Uncertainty(
        $isTwelveMonth: Boolean,
        $indicatorId: String,
        $category: String,
        $indicatorMonth: Ordering,
        $region: String,
        $offset: Int!,
        $limit: Int!,
    ) {
        globalLevel(
            filters: {
                isTwelveMonth: $isTwelveMonth,
                indicatorId: $indicatorId,
                category: $category,
            },
            order: {
                indicatorMonth: $indicatorMonth,
            },
            pagination: {
                limit: $limit,
                offset: $offset,
            },
        ) {
            id
            errorMargin
            indicatorMonth
            indicatorName
            indicatorValueGlobal
        }
        regionLevel(
            filters: {
                indicatorId: $indicatorId,
                isTwelveMonth: $isTwelveMonth,
                region: $region,
            },
            order: {
                indicatorMonth: $indicatorMonth,
            },
            pagination: {
                limit: $limit,
                offset: $offset,
            },
        ) {
            id
            errorMargin
            indicatorMonth
            indicatorName
            indicatorValueRegional
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

    const regionalBreakdownVariables = useMemo((): RegionalBreakdownQueryVariables => ({
        contextIndicatorId: 'total_cases',
        mostRecent: true,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues?.outbreak,
        filterValues?.region,
    ]);

    const uncertaintyVariables = useMemo((): UncertaintyGlobalQueryVariables => ({
        isTwelveMonth: true,
        indicatorId: filterValues?.indicator,
        region: filterValues?.region,
        limit: 12,
        offset: 0,
        category: 'Global',
        indicatorMonth: 'DESC',
    }), [
        filterValues?.indicator,
        filterValues?.region,
    ]);

    const {
        data: regionalBreakdownResponse,
    } = useQuery<RegionalBreakdownQuery, RegionalBreakdownQueryVariables>(
        REGIONAL_BREAKDOWN,
        {
            variables: regionalBreakdownVariables,
        },
    );

    const {
        data: uncertaintyResponse,
    } = useQuery<UncertaintyGlobalQuery, UncertaintyGlobalQueryVariables>(
        UNCERTAINTY,
        {
            variables: uncertaintyVariables,
        },
    );

    const uncertaintyGlobalChart = useMemo(() => (
        uncertaintyResponse?.globalLevel.map((global) => {
            const negativeRange = decimalToPercentage(
                (global.indicatorValueGlobal && global.errorMargin)
                && global.indicatorValueGlobal - global.errorMargin,
            );
            const positiveRange = decimalToPercentage(
                (global.indicatorValueGlobal && global.errorMargin)
                && global.indicatorValueGlobal + global.errorMargin,
            );

            return {
                indicatorValue: decimalToPercentage(global.indicatorValueGlobal),
                date: getShortMonth(global.indicatorMonth),
                uncertainRange: [
                    negativeRange ?? '',
                    positiveRange ?? '',
                ],
            };
        })
    ), [uncertaintyResponse?.globalLevel]);

    const uncertaintyRegionChart = useMemo(() => (
        uncertaintyResponse?.regionLevel.map((region) => {
            const negativeRange = decimalToPercentage(
                (region.indicatorValueRegional && region.errorMargin)
                && region.indicatorValueRegional - region.errorMargin,
            );
            const positiveRange = decimalToPercentage(
                (region.indicatorValueRegional && region.errorMargin)
                && region.indicatorValueRegional + region.errorMargin,
            );

            return {
                indicatorValue: decimalToPercentage(region.indicatorValueRegional),
                date: getShortMonth(region.indicatorMonth),
                uncertainRange: [
                    negativeRange ?? '',
                    positiveRange ?? '',
                ],
            };
        })
    ), [uncertaintyResponse?.regionLevel]);

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

    const totalCase = useCallback(() => {
        totalOutbreakCasesResponse?.epiDataGlobal
            .find(
                (emergency) => emergency.emergency === filterValues?.outbreak,
            );
    }, [
        totalOutbreakCasesResponse?.epiDataGlobal,
        filterValues?.outbreak,
    ])

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
            {uncertaintyChartActive
                ? (
                    <UncertainityChart
                        uncertainData={
                            filterValues?.region
                                ? uncertaintyRegionChart
                                : uncertaintyGlobalChart
                        }
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
                headerDescription="Average indicator value weighted by region"
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    <BarChart
                        data={regionalBreakdownResponse?.epiDataGlobal}
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
                            dataKey="region"
                            tickLine={false}
                            interval={0}
                            fontSize={12}
                        >
                            <LabelList
                                dataKey="region"
                                position="bottom"
                            />
                        </XAxis>
                        <YAxis
                            padding={{ bottom: 12 }}
                            hide
                        />
                        <Bar
                            dataKey="contextIndicatorValue"
                            fill="#8DD2B1"
                            radius={[10, 10, 0, 0]}
                        >
                            {regionalBreakdownResponse?.epiDataGlobal?.map((entry) => (
                                <Cell
                                    key={`Cell -${entry.id}`}
                                />
                            ))}
                            <LabelList
                                dataKey="contextIndicatorValue"
                                position="insideBottomLeft"
                                fill="#8DD2B1"
                                angle={-90}
                                offset={-2.8}
                                fontSize={20}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ContainerCard>
        </div>
    );
}
export default PercentageCardGroup;
