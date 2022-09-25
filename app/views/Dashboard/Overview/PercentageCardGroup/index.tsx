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
    Cell,
} from 'recharts';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    compareDate,
    isNotDefined,
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';

import PercentageStats from '#components/PercentageStats';
import UncertaintyChart from '#components/UncertaintyChart';

import {
    decimalToPercentage,
    getShortMonth,
    normalFormatter,
} from '#utils/common';
import {
    OutbreakQuery,
    OutbreakQueryVariables,
    TotalOutbreakCasesQuery,
    TotalOutbreakCasesQueryVariables,
    RegionalBreakdownQuery,
    RegionalBreakdownQueryVariables,
    UncertaintyQuery,
    UncertaintyQueryVariables,
} from '#generated/types';

import { FilterType } from '../../Filters';

import styles from './styles.css';

const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

const TOTAL_OUTBREAK_CASES = gql`
    query TotalOutbreakCases(
        $contextIndicatorId: String,
        $emergency: String,
        $indicatorId: String,
        $indicatorMonth: Ordering
        $isGlobal: Boolean,
        $isTwelveMonth: Boolean,
        $limit: Int!,
        $mostRecent: Boolean,
        $offset: Int!,
        $region: String,
    ) {
        epiDataGlobal(
            filters: {
                contextIndicatorId: $contextIndicatorId,
                emergency: $emergency,
                isGlobal: $isGlobal,
                mostRecent: $mostRecent,
                region: $region
            }
            pagination: {
                limit: $limit,
                offset: $offset,
            },
            order: {
                contextDate: $indicatorMonth,
            }
        ) {
            contextIndicatorValue
            emergency
        }
        globalLevel(
            filters: {
                emergency: $emergency,
                indicatorId: $indicatorId,
                isTwelveMonth: $isTwelveMonth,
            },
            pagination: {
                limit: $limit,
                offset: $offset,
            },
            order: {
                indicatorMonth: $indicatorMonth,
            }
        ) {
            id
            indicatorId
            indicatorName
            indicatorValueGlobal
            indicatorMonth
            emergency
        }
    }
`;

const OUTBREAK = gql`
   query Outbreak(
        $contextDate: Ordering,
        $contextIndicatorId: String,
        $emergency: String,
        $isGlobal: Boolean,
        $isTwelveMonth: Boolean,
        $limit: Int!,
        $offset: Int!,
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
        order: {
            contextDate: $contextDate,
        }
        pagination: {
            limit: $limit,
            offset: $offset,
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
        $indicatorId: String,
        $isRegionalChart: Boolean,
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
        regionLevel(
        filters: {
            emergency: $emergency,
            indicatorId: $indicatorId,
            isRegionalChart: $isRegionalChart,
        }
        ) {
            id
            region
            indicatorValueRegional
            indicatorMonth
            indicatorId
            indicatorName
        }
    }
`;

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
                emergency
                indicatorMonth
                indicatorId
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
            emergency
            indicatorMonth
            indicatorId
            indicatorName
            indicatorValueRegional
        }
    }
`;

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    uncertaintyChartActive: boolean;
}

function PercentageCardGroup(props: Props) {
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
        indicatorMonth: 'DESC',
        limit: 1,
        offset: 0,
        isTwelveMonth: true,
        indicatorId: filterValues?.indicator,
    }), [
        filterValues?.outbreak,
        filterValues?.region,
        filterValues?.indicator,
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
        limit: 12,
        offset: 0,
        contextDate: 'DESC',
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
        isRegionalChart: true,
        indicatorId: filterValues?.indicator,
    }), [
        filterValues?.outbreak,
        filterValues?.region,
        filterValues?.indicator,
    ]);

    const uncertaintyVariables = useMemo((): UncertaintyQueryVariables => ({
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

    const regionalBreakdown = useMemo(() => (
        regionalBreakdownResponse?.regionLevel.map((region) => (
            {
                id: region.id,
                contextIndicatorValue: decimalToPercentage(region.indicatorValueRegional),
                indicatorMonth: region.indicatorMonth,
                region: region.region,
            }
        ))
    ), [regionalBreakdownResponse?.regionLevel]);

    const filterGlobalRegionalBreakdownEpi = useMemo(() => (
        regionalBreakdownResponse?.epiDataGlobal.map((region) => (
            {
                ...region,
                normalizedValue: normalFormatter().format(region.contextIndicatorValue ?? 0),
            }
        ))
    ), [regionalBreakdownResponse?.epiDataGlobal]);

    const regionalBreakdownEpi = useMemo(() => (
        filterGlobalRegionalBreakdownEpi?.filter((item) => item.region !== 'Global')
    ), [filterGlobalRegionalBreakdownEpi]);

    const {
        data: uncertaintyResponse,
    } = useQuery<UncertaintyQuery, UncertaintyQueryVariables>(
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

            if (isNotDefined(global.errorMargin)) {
                return {
                    emergency: global.emergency,
                    indicatorValue: decimalToPercentage(global.indicatorValueGlobal),
                    date: global.indicatorMonth,
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                };
            }

            return {
                emergency: global.emergency,
                indicatorValue: decimalToPercentage(global.indicatorValueGlobal),
                date: global.indicatorMonth,
                uncertainRange: [
                    negativeRange ?? '',
                    positiveRange ?? '',
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
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

            if (isNotDefined(region.errorMargin)) {
                return {
                    emergency: region.emergency,
                    indicatorValue: decimalToPercentage(region.indicatorValueRegional),
                    date: region.indicatorMonth,
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                };
            }

            return {
                emergency: region.emergency,
                indicatorValue: decimalToPercentage(region.indicatorValueRegional),
                date: region.indicatorMonth,
                uncertainRange: [
                    negativeRange ?? '',
                    positiveRange ?? '',
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
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

    const totalCase = useMemo(() => (
        totalOutbreakCasesResponse?.epiDataGlobal
            .find(
                (emergency) => emergency.emergency === filterValues?.outbreak,
            )
    ), [
        totalOutbreakCasesResponse?.epiDataGlobal,
        filterValues?.outbreak,
    ]);

    const globalTotalCase = useMemo(() => (
        totalOutbreakCasesResponse?.globalLevel
            .find(
                (global) => global.indicatorId === filterValues?.indicator,
            )
    ), [
        totalOutbreakCasesResponse?.globalLevel,
        filterValues?.indicator,
    ]);

    const value = useMemo(() => {
        if (filterValues?.indicator) {
            // FIXME: Make precentageStat component more comfortable with string
            return Number(decimalToPercentage(globalTotalCase?.indicatorValueGlobal));
        }
        return totalCase?.contextIndicatorValue;
    }, [
        globalTotalCase?.indicatorValueGlobal,
        filterValues?.indicator,
        totalCase?.contextIndicatorValue,
    ]);

    const customLabel = (val: number | string | undefined) => (
        `${val} %`
    );

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <PercentageStats
                className={styles.globalStatCard}
                heading={totalCase?.emergency}
                headingSize="extraSmall"
                suffix={filterValues?.indicator && '%'}
                headerDescription={(
                    <p>
                        All Outbreak numbers:
                    </p>
                )}
                statValue={value}
            />
            {uncertaintyChartActive
                ? (
                    <UncertaintyChart
                        uncertainData={
                            filterValues?.region
                                ? uncertaintyRegionChart
                                : uncertaintyGlobalChart
                        }
                        emergencyFilterValue={filterValues?.outbreak}
                        heading="Indicator overview over the last 12 months"
                        headingDescription={`Trend chart for ${filterValues?.indicator}`}
                    />
                ) : (
                    <ContainerCard
                        className={styles.trendsCard}
                        heading="Outbreak over last 12 months"
                        headingSize="extraSmall"
                        contentClassName={styles.responsiveContent}
                        headerDescription={`Number of cases for ${filterValues?.outbreak}`}
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
                                    reversed
                                    axisLine={false}
                                    tickLine={false}
                                    padding={{ left: 20 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    padding={{ top: 12 }}
                                    tickFormatter={normalizedTickFormatter}
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
                headerDescription={filterValues?.indicator
                    ? `Number of cases for ${filterValues.indicator}`
                    : `Number of cases for ${filterValues?.outbreak}`}
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    <BarChart
                        data={
                            (filterValues?.region || filterValues?.indicator)
                                ? regionalBreakdown
                                : regionalBreakdownEpi
                        }
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
                                dataKey={
                                    (filterValues?.region || filterValues?.indicator)
                                        ? 'contextIndicatorValue'
                                        : 'normalizedValue'
                                }
                                position="insideBottomLeft"
                                fill="#8DD2B1"
                                angle={-90}
                                offset={-2.8}
                                fontSize={14}
                                formatter={customLabel}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ContainerCard>
        </div>
    );
}
export default PercentageCardGroup;
