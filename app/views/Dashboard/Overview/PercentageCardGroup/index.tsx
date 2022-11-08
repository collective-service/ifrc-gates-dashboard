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
    LabelList,
    Cell,
} from 'recharts';
import {
    ContainerCard,
    Element,
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
import CustomTooltip from '#components/CustomTooltip';

import {
    decimalToPercentage,
    formatNumber,
    getShortMonth,
    normalFormatter,
    FormatType,
    negativeToZero,
    positiveToZero,
} from '#utils/common';
import {
    OverviewStatsQuery,
    OverviewStatsQueryVariables,
} from '#generated/types';

import { FilterType } from '../../Filters';

import styles from './styles.css';

export interface RegionalTooltipData {
    contextIndicatorValue?: number;
    fill?: number;
    id: string;
    indicatorMonth?: string;
    contextDate?: string;
    region?: string;
    format?: FormatType;
}

interface LegendProps {
    payload?: {
        value: string;
        type?: string;
        id?: string
    }[];
}

const normalizedTickFormatter = (d: number) => normalFormatter().format(d);
const dateTickFormatter = (d: string) => getShortMonth(d);

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
            format
        }
        totalCasesGlobal: globalLevel (
            filters: {
                emergency: $emergency,
                indicatorId: $indicatorId,
                isTwelveMonth: true,
                category: "Global",
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
            format
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
            format
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
                category: "Global",
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
            format
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
            indicatorValueRegional
            region
            format
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

interface Payload {
    name?: string;
    value?: number;
    payload?: RegionalTooltipData;
}

interface TooltipProps {
    active?: boolean;
    payload?: Payload[];
}
interface OutbreakTooltipProps {
    active?: boolean;
    payload?: {
        name?: string;
        value?: number;
        payload?: {
            contextDate: string;
            id: string;
            format: string;
        };
    }[];
}

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

    const cardHeader = useMemo(() => {
        if (selectedIndicatorName && filterValues?.region && selectedOutbreakName) {
            return `Total percentage for ${filterValues?.region}`;
        }
        if ((selectedIndicatorName && selectedOutbreakName) && !filterValues?.region) {
            return 'Global';
        }
        if ((!selectedIndicatorName && !filterValues?.region) && selectedOutbreakName) {
            return `Total Number of ${selectedOutbreakName} cases`;
        }
        return 'Total percentage';
    }, [
        filterValues,
        selectedIndicatorName,
        selectedOutbreakName,
    ]);

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
        loading,
        previousData: previousOverviewStat,
        data: overviewStatsResponse = previousOverviewStat,
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
                contextIndicatorValue: region.indicatorValueRegional,
                normalizedValue: formatNumber(
                    region.format as FormatType,
                    region.indicatorValueRegional ?? 0,
                ),
                indicatorMonth: region.indicatorMonth,
                region: region.region,
                format: region.format,
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
                contextIndicatorValue: region.contextIndicatorValue ?? 0,
                normalizedValue: formatNumber(
                    region.format as FormatType,
                    region.contextIndicatorValue ?? 0,
                ),
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
                    tooltipValue: global.indicatorValueGlobal,
                    date: global.indicatorMonth,
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                    indicatorName: global.indicatorName,
                    id: global.id,
                    format: global.format as FormatType,
                };
            }

            return {
                emergency: global.emergency,
                indicatorValue: decimalToPercentage(global.indicatorValueGlobal),
                tooltipValue: global.indicatorValueGlobal,
                date: global.indicatorMonth,
                uncertainRange: [
                    negativeRange,
                    positiveRange,
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
                indicatorName: global.indicatorName,
                id: global.id,
                format: global.format as FormatType,
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
                    tooltipValue: region.indicatorValueRegional,
                    date: region.indicatorMonth,
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                    region: region.region,
                    indicatorName: region.indicatorName,
                    id: region.id,
                    format: region.format as FormatType,
                };
            }

            return {
                emergency: region.emergency,
                indicatorValue: decimalToPercentage(region.indicatorValueRegional),
                tooltipValue: region.indicatorValueRegional,
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
                format: region.format as FormatType,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [overviewStatsResponse?.uncertaintyRegion]);

    const outbreakLineChart = useMemo(() => (
        overviewStatsResponse?.outbreak.map((outbreak) => (
            {
                id: outbreak.id,
                emergency: outbreak.emergency,
                contextDate: outbreak.contextDate,
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

    const regionTotalCase = useMemo(() => (
        regionalBreakdownRegion?.find(
            (total) => total.region === filterValues?.region,
        )
    ), [
        regionalBreakdownRegion,
        filterValues?.region,
    ]);

    const totalCaseValue = useMemo(() => {
        if (filterValues?.region && filterValues?.indicator && filterValues?.outbreak) {
            return formatNumber(
                regionTotalCase?.format as FormatType,
                regionTotalCase?.contextIndicatorValue ?? 0,
            );
        }
        if (filterValues?.indicator) {
            return formatNumber(
                (globalTotalCase?.format ?? 'raw') as FormatType,
                globalTotalCase?.indicatorValueGlobal ?? 0,
            );
        }
        return formatNumber(
            (totalCase?.format ?? 'raw') as FormatType,
            totalCase?.contextIndicatorValue ?? 0,
        );
    }, [
        regionTotalCase?.contextIndicatorValue,
        globalTotalCase?.indicatorValueGlobal,
        filterValues?.indicator,
        totalCase?.contextIndicatorValue,
        filterValues?.region,
        filterValues?.outbreak,
        globalTotalCase?.format,
        regionTotalCase?.format,
        totalCase?.format,
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

    const customRegionalTooltip = (tooltipProps: TooltipProps) => {
        const {
            active,
            payload: regionalData,
        } = tooltipProps;
        if (active && regionalData && regionalData.length > 0) {
            const format = regionalData[0]?.payload?.format as FormatType;

            return (
                <CustomTooltip
                    format={filterValues?.indicator ? format : 'raw'}
                    heading={regionalData[0].payload?.region}
                    subHeading={filterValues?.indicator
                        ? (`(${regionalData[0].payload?.indicatorMonth})`)
                        : (`(${regionalData[0].payload?.contextDate})`)}
                    value={regionalData[0].payload?.contextIndicatorValue}
                />
            );
        }
        return null;
    };
    const customOutbreakTooltip = (outbreakTooltipProps: OutbreakTooltipProps) => {
        const {
            active,
            payload: outbreakData,
        } = outbreakTooltipProps;

        if (active && outbreakData) {
            return (
                <CustomTooltip
                    format="raw"
                    heading={outbreakData[0].name}
                    subHeading={`(${outbreakData[0].payload?.contextDate})`}
                    value={outbreakData[0].value}
                />
            );
        }
        return null;
    };

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <PercentageStats
                className={styles.globalStatCard}
                heading={cardHeader}
                subHeading={selectedIndicatorName ?? filterValues?.indicator}
                headingSize="extraSmall"
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
                        loading={loading}
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
                            loading={loading}
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
                                    tickLine={false}
                                    padding={{ left: 20 }}
                                    tickFormatter={dateTickFormatter}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    padding={{ top: 12 }}
                                    tickFormatter={normalizedTickFormatter}
                                />
                                <Tooltip
                                    content={customOutbreakTooltip}
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
                    ? `${selectedIndicatorName ?? '-'}`
                    : `Number of cases for ${selectedOutbreakName}`}
            >
                {(filterValues?.indicator)
                    ? (
                        <ChartContainer
                            data={regionalBreakdownRegion}
                            loading={loading}
                            className={styles.responsiveContainer}
                        >
                            <BarChart
                                data={regionalBreakdownRegion}
                                barSize={18}
                            >
                                <Tooltip
                                    cursor={false}
                                    content={customRegionalTooltip}
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
                        </ChartContainer>
                    ) : (
                        <ChartContainer
                            data={regionalBreakdownGlobal}
                            loading={loading}
                            className={styles.responsiveContainer}
                        >
                            <BarChart
                                data={regionalBreakdownGlobal}
                                barSize={18}
                            >
                                <Tooltip
                                    cursor={false}
                                    content={customRegionalTooltip}
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
                        </ChartContainer>
                    )}
            </ContainerCard>
        </div>
    );
}
export default PercentageCardGroup;
