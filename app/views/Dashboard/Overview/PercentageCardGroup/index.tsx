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
    ContainerCard, Element,
} from '@the-deep/deep-ui';
import {
    compareDate,
    isNotDefined,
    isDefined,
    _cs,
} from '@togglecorp/fujs';
import { IoSquare } from 'react-icons/io5';
import { useQuery, gql } from '@apollo/client';

import PercentageStats from '#components/PercentageStats';
import UncertaintyChart from '#components/UncertaintyChart';
import ChartContainer from '#components/ChartContainer';

import {
    decimalToPercentage,
    getShortMonth,
    normalFormatter,
} from '#utils/common';
import {
    OverviewStatsQuery,
    OverviewStatsQueryVariables,
} from '#generated/types';

import { FilterType } from '../../Filters';

import styles from './styles.css';

interface LegendProps {
    payload?: {
        value: string;
        type?: string;
        id?: string
    }[];
}

const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

const customLabel = (val: number | string | undefined) => (
    `${val}%`
);

const OVERVIEW_STATS = gql`
    query OverviewStats(
        $emergency: String,
        $indicatorId: String,
        $isGlobal: Boolean,
        $region: String,
    ) {
        totalCases: epiDataGlobal (
            filters: {
                contextIndicatorId: "total_cases",
                emergency: $emergency,
                isGlobal: $isGlobal,
                mostRecent: true
                region: $region
            }
            pagination: {
                limit: 1,
                offset: 0
            }
            order: {
                contextDate: DESC
            }
        ) {
            contextIndicatorValue
            emergency
        }
        totalCasesGlobal: globalLevel (
            filters: {
                emergency: $emergency,
                indicatorId: $indicatorId,
                isTwelveMonth: true
            }
            pagination: {
                limit: 1,
                offset: 0
            }
            order: {
                indicatorMonth: DESC
            }
        ) {
            id
            indicatorId
            indicatorName
            indicatorValueGlobal
            indicatorMonth
            emergency
        }
        outbreak: epiDataGlobal (
            filters: {
                isTwelveMonth: true,
                isGlobal: $isGlobal,
                emergency: $emergency,
                contextIndicatorId: "total_cases",
                region: $region,
            }
            order: {
                contextDate: DESC,
            }
            pagination: {
                limit:12,
                offset:0,
            }
        ) {
            id
            contextIndicatorValue
            contextDate
            emergency
        }
        regionalBreakdownGlobal: epiDataGlobal (
            filters: {
                isTwelveMonth: true
                emergency: $emergency,
                contextIndicatorId: "total_cases"
                mostRecent: true
                isRegionalChart: true
            }
            order: {
                contextDate: DESC
            }
        ) {
            id
            contextIndicatorValue
            emergency
            contextDate
            region
            format
        }
        regionalBreakdownRegion: regionLevel (
            filters: {
                emergency: $emergency,
                indicatorId: $indicatorId,
                isRegionalChart: true,
            }
            order: {
                indicatorMonth: DESC
            }
        ) {
            id
            region
            indicatorValueRegional
            indicatorMonth
            indicatorId
            indicatorName
        }
        uncertaintyGlobal: globalLevel (
            filters: {
                isTwelveMonth: true,
                indicatorId: $indicatorId,
                category: "Global",
            }
            order: {
                indicatorMonth: DESC
            }
            pagination: {
                limit: 12,
                offset: 0
            }
        ) {
            id
            errorMargin
            emergency
            indicatorMonth
            indicatorId
            indicatorName
            indicatorValueGlobal
            format
        }
        uncertaintyRegion: regionLevel (
            filters: {
                indicatorId: $indicatorId,
                isTwelveMonth: true,
                region: $region,
                category: "Global"
            }
            order: {
                indicatorMonth: DESC
            }
            pagination: {
                limit: 12,
                offset: 0
            }
        ) {
            id
            errorMargin
            emergency
            indicatorMonth
            indicatorId
            indicatorName
            indicatorValueRegional,
            region,
        }
    }
`;

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    uncertaintyChartActive: boolean;
    selectedIndicatorName: string | undefined;
    selectedOutbreakName: string | undefined;
}

const negativeToZero = (
    (indicatorValue?: number | null, errorMarginValue?: number | null) => {
        const valueInd = isNotDefined(indicatorValue) ? 0 : indicatorValue;
        const valueErr = isNotDefined(errorMarginValue) ? 0 : errorMarginValue;
        const difference = (valueInd - valueErr) < 0 ? 0 : valueInd - valueErr;

        return decimalToPercentage(difference);
    });
const positiveToZero = (
    (indicatorValue?: number | null, errorMarginValue?: number | null) => {
        const valueInd = isNotDefined(indicatorValue) ? 0 : indicatorValue;
        const valueErr = isNotDefined(errorMarginValue) ? 0 : errorMarginValue;
        const sum = (valueInd + valueErr) > 1 ? 1 : valueInd + valueErr;

        return decimalToPercentage(sum);
    });

function PercentageCardGroup(props: Props) {
    const {
        className,
        uncertaintyChartActive,
        filterValues,
        selectedIndicatorName,
        selectedOutbreakName,
    } = props;

    const getLineChartColor = useCallback((outbreak?: string) => {
        let color = '';
        if (outbreak === 'COVID-19') {
            color = '#FFDD98';
        } else if (outbreak === 'Ebola') {
            color = '#CCB387';
        } else if (outbreak === 'Monkeypox') {
            color = '#ACA28E';
        } else {
            color = '#C09A57';
        }

        return color;
    }, []);

    const overviewStatsVariables = useMemo((): OverviewStatsQueryVariables => ({
        emergency: filterValues?.outbreak,
        indicatorId: filterValues?.indicator,
        region: filterValues?.region,
        isGlobal: !filterValues?.region,
    }), [
        filterValues?.indicator,
        filterValues?.outbreak,
        filterValues?.region,
    ]);

    const {
        previousData: previousOverviewStat,
        data: overviewStatsResponse = previousOverviewStat,
        loading: loadingData,
    } = useQuery<OverviewStatsQuery, OverviewStatsQueryVariables>(
        OVERVIEW_STATS,
        {
            variables: overviewStatsVariables,
        },
    );

    const regionalBreakdownRegion = useMemo(() => (
        overviewStatsResponse?.regionalBreakdownRegion.map((region) => (
            {
                id: region.id,
                contextIndicatorValue: decimalToPercentage(region.indicatorValueRegional),
                indicatorMonth: region.indicatorMonth,
                region: region.region,
                fill: isDefined(filterValues?.region)
                    && (region.region !== filterValues?.region) ? 0.2 : 1,
            }
        ))
    ), [
        overviewStatsResponse?.regionalBreakdownRegion,
        filterValues?.region,
    ]);

    const regionalBreakdownGlobal = useMemo(() => (
        overviewStatsResponse?.regionalBreakdownGlobal.map((region) => (
            {
                ...region,
                normalizedValue: normalFormatter().format(region.contextIndicatorValue ?? 0),
                fill: isDefined(filterValues?.region)
                    && (region.region !== filterValues?.region) ? 0.2 : 1,
            }
        )).filter((item) => item.region !== 'Global')
    ), [
        overviewStatsResponse?.regionalBreakdownGlobal,
        filterValues?.region,
    ]);

    const uncertaintyGlobalChart = useMemo(() => (
        overviewStatsResponse?.uncertaintyGlobal.map((global) => {
            const negativeRange = negativeToZero(global.indicatorValueGlobal, global.errorMargin);
            const positiveRange = positiveToZero(global.indicatorValueGlobal, global.errorMargin);

            if (isNotDefined(global.errorMargin)) {
                return {
                    emergency: global.emergency,
                    indicatorValue: decimalToPercentage(global.indicatorValueGlobal),
                    date: global.indicatorMonth,
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                    indicatorName: global.indicatorName,
                    id: global.id,
                };
            }

            return {
                emergency: global.emergency,
                indicatorValue: decimalToPercentage(global.indicatorValueGlobal),
                date: global.indicatorMonth,
                uncertainRange: [
                    negativeRange,
                    positiveRange,
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
                indicatorName: global.indicatorName,
                id: global.id,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [overviewStatsResponse?.uncertaintyGlobal]);

    const uncertaintyRegionChart = useMemo(() => (
        overviewStatsResponse?.uncertaintyRegion.map((region) => {
            const negativeRange = negativeToZero(region.indicatorValueRegional, region.errorMargin);
            const positiveRange = positiveToZero(region.indicatorValueRegional, region.errorMargin);

            if (isNotDefined(region.errorMargin)) {
                return {
                    emergency: region.emergency,
                    indicatorValue: decimalToPercentage(region.indicatorValueRegional),
                    date: region.indicatorMonth,
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                    region: region.region,
                    indicatorName: region.indicatorName,
                    id: region.id,
                };
            }

            return {
                emergency: region.emergency,
                indicatorValue: decimalToPercentage(region.indicatorValueRegional),
                date: region.indicatorMonth,
                uncertainRange: [
                    negativeRange,
                    positiveRange,
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
                region: region.region,
                indicatorName: region.indicatorName,
                id: region.id,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [overviewStatsResponse?.uncertaintyRegion]);

    const outbreakLineChart = useMemo(() => (
        overviewStatsResponse?.outbreak.map((outbreak) => (
            {
                id: outbreak.id,
                emergency: outbreak.emergency,
                contextDate: getShortMonth(outbreak.contextDate),
                [outbreak.emergency]: outbreak.contextIndicatorValue,
            }
        ))
    ), [overviewStatsResponse?.outbreak]);

    const totalCase = useMemo(() => (
        overviewStatsResponse?.totalCases
            .find(
                (emergency) => emergency.emergency === filterValues?.outbreak,
            )
    ), [
        overviewStatsResponse?.totalCases,
        filterValues?.outbreak,
    ]);

    const globalTotalCase = useMemo(() => (
        overviewStatsResponse?.totalCasesGlobal
            .find(
                (global) => global.indicatorId === filterValues?.indicator,
            )
    ), [
        overviewStatsResponse?.totalCasesGlobal,
        filterValues?.indicator,
    ]);

    const totalCaseValue = useMemo(() => {
        if (filterValues?.indicator) {
            return decimalToPercentage(globalTotalCase?.indicatorValueGlobal);
        }
        return totalCase?.contextIndicatorValue;
    }, [
        globalTotalCase?.indicatorValueGlobal,
        filterValues?.indicator,
        totalCase?.contextIndicatorValue,
    ]);

    const renderLegend = useCallback((legendProps: LegendProps) => {
        const { payload } = legendProps;
        return (
            <>
                {payload?.map((entry) => (
                    <Element
                        key={`item-${entry.id}`}
                        actions={(
                            <>
                                <IoSquare color={getLineChartColor(filterValues?.outbreak)} />
                                <span className={styles.outbreakLegendTitleName}>
                                    {entry.value}
                                </span>
                            </>
                        )}
                    />
                ))}
            </>
        );
    }, [
        filterValues?.outbreak,
        getLineChartColor,
    ]);

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <PercentageStats
                className={styles.globalStatCard}
                heading={!filterValues?.indicator && totalCase?.emergency}
                headingSize="extraSmall"
                suffix={filterValues?.indicator && '%'}
                headerDescription={!filterValues?.indicator && (
                    <p>
                        All Outbreak numbers:
                    </p>
                )}
                statValue={totalCaseValue}
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
                        headingDescription={`Trend chart for ${selectedIndicatorName ?? filterValues?.indicator}`}
                    />
                ) : (
                    <ContainerCard
                        className={styles.trendsCard}
                        headingClassName={styles.headingContent}
                        heading="Outbreak over last 12 months"
                        headingSize="extraSmall"
                        contentClassName={styles.responsiveContent}
                        headerDescription={`Number of cases for ${filterValues?.outbreak}`}
                    >
                        <ChartContainer
                            className={styles.responsiveContainer}
                            data={outbreakLineChart}
                            loading={loadingData}
                        >
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
                                <Legend content={renderLegend} />
                                <Line
                                    type="monotone"
                                    dataKey={filterValues?.outbreak}
                                    stroke={getLineChartColor(filterValues?.outbreak)}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </ContainerCard>
                )}

            <ContainerCard
                className={styles.regionsCard}
                contentClassName={styles.responsiveContent}
                headingClassName={styles.headingContent}
                heading={filterValues?.indicator ? 'Regional Percentage' : 'Regional Breakdown'}
                headingSize="extraSmall"
                headerDescription={filterValues?.indicator
                    ? selectedIndicatorName ?? filterValues.indicator
                    : selectedOutbreakName ?? filterValues?.outbreak}
            >
                <ResponsiveContainer
                    className={styles.responsiveContainer}
                >
                    {(filterValues?.indicator)
                        ? (
                            <BarChart
                                data={regionalBreakdownRegion}
                                barSize={18}
                            >
                                <Tooltip
                                    cursor={false}
                                />
                                <XAxis
                                    dataKey="region"
                                    tickLine={false}
                                    fontSize={12}
                                />
                                <YAxis
                                    padding={{ bottom: 0 }}
                                    hide
                                />
                                <Bar
                                    dataKey="contextIndicatorValue"
                                    radius={[10, 10, 0, 0]}
                                >
                                    {regionalBreakdownRegion?.map((entry) => (
                                        <Cell
                                            key={`Cell -${entry.id}`}
                                            fill="#8DD2B1"
                                            opacity={entry.fill}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="contextIndicatorValue"
                                        position="insideBottomLeft"
                                        fill="#8DD2B1"
                                        fontSize={16}
                                        angle={270}
                                        dx={-15}
                                        dy={-3}
                                        formatter={customLabel}
                                    />
                                </Bar>
                            </BarChart>
                        ) : (
                            <BarChart
                                data={regionalBreakdownGlobal}
                                barSize={18}
                            >
                                <Tooltip
                                    cursor={false}
                                />
                                <XAxis
                                    dataKey="region"
                                    tickLine={false}
                                    fontSize={12}
                                />
                                <YAxis
                                    padding={{ bottom: 0 }}
                                    hide
                                />
                                <Bar
                                    dataKey="contextIndicatorValue"
                                    radius={[10, 10, 0, 0]}
                                >
                                    {regionalBreakdownGlobal?.map((entry) => (
                                        <Cell
                                            fill="#8DD2B1"
                                            key={`Cell -${entry.id}`}
                                            opacity={entry.fill}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="normalizedValue"
                                        position="insideBottomLeft"
                                        fill="#8DD2B1"
                                        fontSize={16}
                                        angle={270}
                                        dx={-15}
                                        dy={-3}
                                    />
                                </Bar>
                            </BarChart>
                        )}
                </ResponsiveContainer>
            </ContainerCard>
        </div>
    );
}
export default PercentageCardGroup;
