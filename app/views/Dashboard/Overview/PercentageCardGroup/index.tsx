import React, { useCallback, useMemo } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip as ChartTooltip,
    Legend,
    LabelList,
    Cell,
} from 'recharts';
import {
    ContainerCard,
    Element,
    ListView,
    Tooltip,
} from '@the-deep/deep-ui';
import {
    compareDate,
    isNotDefined,
    isDefined,
    _cs,
    compareNumber,
    bound,
} from '@togglecorp/fujs';
import { IoSquare } from 'react-icons/io5';
import { useQuery, gql } from '@apollo/client';

import PercentageStats from '#components/PercentageStats';
import UncertaintyChart from '#components/UncertaintyChart';
import ChartContainer from '#components/ChartContainer';
import CustomTooltip from '#components/CustomTooltip';
import ProgressBar from '#components/ProgressBar';
import { IndicatorType } from '#views/Dashboard';

import {
    decimalToPercentage,
    formatNumber,
    getShortMonth,
    normalFormatter,
    FormatType,
    negativeToZero,
    positiveToZero,
    colors,
} from '#utils/common';
import {
    OverviewStatsQuery,
    OverviewStatsQueryVariables,
} from '#generated/types';

import { FilterType } from '../../Filters';

import styles from './styles.css';

export interface RegionalTooltipData {
    indicatorValue?: number;
    fill?: number;
    id: string;
    indicatorMonth?: string;
    region?: string;
    format?: FormatType;
}

interface LegendProps {
    payload?: {
        value: string;
        type?: string;
        id?: string;
    }[];
}

const normalizedTickFormatter = (d: number) => normalFormatter().format(d);
const dateTickFormatter = (d: string) => getShortMonth(d);

const OVERVIEW_STATS = gql`
    query OverviewStats(
        $emergency: String,
        $indicatorId: String,
        $region: String,
        $subvariable: String,
    ) {
        totalCasesGlobal: globalLevel (
            filters: {
                emergency: $emergency,
                indicatorId: $indicatorId,
                isTwelveMonth: true,
                category: "Global",
                subvariable: $subvariable,
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
            type
            errorMargin
            indicatorValueGlobal
            indicatorMonth
            emergency
            format
        }
        outbreak: globalLevel (
            filters: {
                category: "Global",
                emergency: $emergency,
                isTwelveMonth: true,
                indicatorId: $indicatorId,
                subvariable: $subvariable,
            }
            order: {
                indicatorMonth: DESC
            }
            pagination: {
                limit: 12
            }
        ) {
            id
            indicatorId
            indicatorMonth
            indicatorValueGlobal
            format
            emergency
        }
        outbreakRegion: regionLevel (
            filters: {
                category: "Global",
                emergency: $emergency,
                isTwelveMonth: true,
                indicatorId: $indicatorId,
                region: $region,
                subvariable: $subvariable,
            }
            order: {
                indicatorMonth: DESC
            }
            pagination: {
                limit: 12
            }
        ) {
            id
            indicatorId
            indicatorMonth
            indicatorValueRegional
            format
            emergency
        }
        regionalBreakdownRegion: regionLevel (
            filters: {
                emergency: $emergency,
                indicatorId: $indicatorId,
                isRegionalChart: true,
                category: "Global",
                subvariable: $subvariable
            }
        ) {
            id
            region
            indicatorValueRegional
            indicatorMonth
            indicatorId
            indicatorName
            type
            errorMargin
            format
        }
        uncertaintyGlobal: globalLevel (
            filters: {
                emergency: $emergency,
                isTwelveMonth: true,
                indicatorId: $indicatorId,
                category: "Global",
                subvariable: $subvariable,
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
            type
            errorMargin
            indicatorValueGlobal
            format
            subvariable
        }
        uncertaintyRegion: regionLevel (
            filters: {
                emergency: $emergency,
                indicatorId: $indicatorId,
                isTwelveMonth: true,
                region: $region,
                category: "Global",
                subvariable: $subvariable
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
            type
            errorMargin
            indicatorValueRegional
            region
            format
            subvariable
        }
        globalLevelSubvariables (
            emergency: $emergency,
            indicatorId: $indicatorId,
            category: "Global",
        ) {
            format
            indicatorDescription
            indicatorMonth
            indicatorValue
            subvariable
        }
        regionLevelSubvariables (
            emergency: $emergency,
            indicatorId: $indicatorId,
            region: $region,
            category: "Global",
            ) {
            format
            indicatorDescription
            indicatorMonth
            indicatorValue
            subvariable
        }
    }
`;

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    uncertaintyChartActive: boolean;
    selectedIndicatorName: string | undefined;
    selectedOutbreakName: string | undefined;
    selectedIndicatorType: IndicatorType | undefined;
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
            unformattedValue: number;
        };
    }[];
}

interface GlobalRegionCard {
    indicatorDescription?: string | null;
    indicatorMonth: string;
    indicatorValue?: number | null;
    format?: string | null;
    subvariable: string;
}

const globalRegionKeySelector = (d: GlobalRegionCard) => d.subvariable;

function PercentageCardGroup(props: Props) {
    const {
        className,
        uncertaintyChartActive,
        filterValues,
        selectedIndicatorName,
        selectedOutbreakName,
        selectedIndicatorType,
    } = props;

    const overviewStatsVariables = useMemo((): OverviewStatsQueryVariables => ({
        emergency: filterValues?.outbreak,
        indicatorId: filterValues?.indicator ?? 'new_cases_per_million',
        region: filterValues?.region,
        subvariable: filterValues?.subvariable,
    }), [
        filterValues?.indicator,
        filterValues?.outbreak,
        filterValues?.region,
        filterValues?.subvariable,
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
    const globalRegionCardList = useMemo(() => {
        const global = [...(overviewStatsResponse?.globalLevelSubvariables) ?? []].sort(
            (a, b) => compareNumber(b.indicatorValue, a.indicatorValue),
        );
        const region = [...(overviewStatsResponse?.regionLevelSubvariables) ?? []].sort(
            (a, b) => compareNumber(b.indicatorValue, a.indicatorValue),
        );

        if (filterValues?.region) {
            return region;
        }
        return global;
    }, [
        overviewStatsResponse?.globalLevelSubvariables,
        overviewStatsResponse?.regionLevelSubvariables,
        filterValues?.region,
    ]);

    const selectedGlobalRegion = useMemo(() => (
        globalRegionCardList.find(
            (select) => select.subvariable === filterValues?.subvariable,
        )
    ), [
        globalRegionCardList,
        filterValues?.subvariable,
    ]);

    const totalCasesGlobal = useMemo(() => (
        overviewStatsResponse?.totalCasesGlobal.map((global) => (
            {
                ...global,
                normalizedValue: formatNumber(
                    global.format as FormatType,
                    global.indicatorValueGlobal,
                ),
            }
        ))), [
        overviewStatsResponse?.totalCasesGlobal,
    ]);

    const globalTotalCase = totalCasesGlobal?.[0];

    const regionalBreakdownRegion = useMemo(() => (
        overviewStatsResponse?.regionalBreakdownRegion.map((region) => ({
            id: region.id,
            indicatorValue: region.indicatorValueRegional,
            normalizedValue: formatNumber(
                region.format as FormatType,
                region.indicatorValueRegional,
            ),
            indicatorMonth: region.indicatorMonth,
            region: region.region,
            format: region.format,
            fill: isDefined(filterValues?.region)
                && (region.region !== filterValues?.region) ? 0.2 : 1,
            indicatorType: region.type,
            errorMargin: region.errorMargin,
        }))
    ), [
        overviewStatsResponse?.regionalBreakdownRegion,
        filterValues?.region,
    ]);

    const regionTotalCase = useMemo(() => (
        regionalBreakdownRegion?.find((total) => (
            total.region === filterValues?.region
        ))
    ), [
        regionalBreakdownRegion,
        filterValues?.region,
    ]);

    const cardHeader = useMemo(() => {
        if ((selectedIndicatorName && filterValues?.region && selectedOutbreakName)
            && regionTotalCase?.format === 'percent') {
            return `Total percentage for ${filterValues?.region}`;
        }
        if (selectedIndicatorName && filterValues?.region && selectedOutbreakName) {
            return `Total number for ${filterValues?.region}`;
        }
        if ((selectedIndicatorName && selectedOutbreakName) && !filterValues?.region) {
            return 'Global';
        }
        if ((!selectedIndicatorName && !filterValues?.region) && selectedOutbreakName) {
            return `New cases per million for ${selectedOutbreakName}`;
        }
        if (selectedOutbreakName && filterValues?.region) {
            return `New cases per million for ${selectedOutbreakName}`;
        }
        return 'Total percentage';
    }, [
        filterValues,
        selectedIndicatorName,
        selectedOutbreakName,
        regionTotalCase?.format,
    ]);

    const outbreakSubHeader = selectedIndicatorName
        ? `Trend chart for ${selectedIndicatorName ?? filterValues?.indicator}`
        : `New cases per million for ${selectedOutbreakName}`;

    const totalCaseValue = filterValues?.region
        ? regionTotalCase?.indicatorValue
        : globalTotalCase?.indicatorValueGlobal;

    const totalCaseFormat = filterValues?.region
        ? (regionTotalCase?.format as FormatType | undefined)
        : (globalTotalCase?.format as FormatType | undefined);

    const percentageCardMonth = filterValues?.region
        ? regionTotalCase?.indicatorMonth
        : globalTotalCase?.indicatorMonth;

    const uncertaintyRange = useMemo(() => {
        if (filterValues?.indicator
            && (regionTotalCase?.indicatorType === 'Social Behavioural Indicators')
            && (regionTotalCase?.errorMargin)
        ) {
            const negativeRange = negativeToZero(
                regionTotalCase.indicatorValue,
                regionTotalCase.errorMargin,
            );
            const positiveRange = positiveToZero(
                regionTotalCase.indicatorValue,
                regionTotalCase.errorMargin,
            );

            const range = regionTotalCase?.format === 'percent'
                ? `${negativeRange}% - ${positiveRange}%`
                : `${negativeRange} - ${positiveRange}`;
            return range;
        }
        if (filterValues?.indicator
            && (globalTotalCase?.type === 'Social Behavioural Indicators')
            && (globalTotalCase?.errorMargin)
        ) {
            const negativeRange = negativeToZero(
                globalTotalCase?.indicatorValueGlobal,
                globalTotalCase?.errorMargin,
            );
            const positiveRange = positiveToZero(
                globalTotalCase?.indicatorValueGlobal,
                globalTotalCase?.errorMargin,
            );

            const range = globalTotalCase?.format === 'percent'
                ? `${negativeRange}% - ${positiveRange}%`
                : `${negativeRange} - ${positiveRange}`;
            return range;
        }
        return undefined;
    }, [
        filterValues?.indicator,
        regionTotalCase,
        globalTotalCase,
    ]);

    const uncertaintyGlobalChart = useMemo(() => (
        overviewStatsResponse?.uncertaintyGlobal.map((global) => {
            const negativeRange = negativeToZero(global.indicatorValueGlobal, global.errorMargin);
            const positiveRange = positiveToZero(global.indicatorValueGlobal, global.errorMargin);

            if (isNotDefined(global.errorMargin)) {
                return {
                    emergency: global.emergency,
                    indicatorValue: global.format === 'percent'
                        ? decimalToPercentage(global.indicatorValueGlobal)
                        : global.indicatorValueGlobal,
                    tooltipValue: global.indicatorValueGlobal,
                    date: global.indicatorMonth,
                    indicatorName: global.indicatorName,
                    id: global.id,
                    format: global.format as FormatType,
                    subvariable: global.subvariable,
                    indicatorType: global.type,
                    errorMargin: global.errorMargin,
                    interpolated: 0,
                };
            }

            return {
                emergency: global.emergency,
                indicatorValue: global.format === 'percent'
                    ? decimalToPercentage(global.indicatorValueGlobal)
                    : global.indicatorValueGlobal,
                tooltipValue: global.indicatorValueGlobal,
                date: global.indicatorMonth,
                uncertainRange: [
                    negativeRange,
                    positiveRange,
                ],
                minimumValue: isDefined(global.indicatorValueGlobal)
                    ? bound(global.indicatorValueGlobal - global.errorMargin, 0, 1)
                    : undefined,
                maximumValue: isDefined(global.indicatorValueGlobal)
                    ? bound(global.indicatorValueGlobal + global.errorMargin, 0, 1)
                    : undefined,
                indicatorName: global.indicatorName,
                indicatorType: global.type,
                errorMargin: global.errorMargin,
                id: global.id,
                format: global.format as FormatType,
                subvariable: global.subvariable,
                interpolated: 0,
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
                    indicatorValue: region.format === 'percent'
                        ? decimalToPercentage(region.indicatorValueRegional)
                        : region.indicatorValueRegional,
                    tooltipValue: region.indicatorValueRegional,
                    date: region.indicatorMonth,
                    region: region.region,
                    indicatorName: region.indicatorName,
                    indicatorType: region.type,
                    errorMargin: region.errorMargin,
                    id: region.id,
                    format: region.format as FormatType,
                    subvariable: region.subvariable,
                    interpolated: 0,
                };
            }

            return {
                emergency: region.emergency,
                indicatorValue: region.format === 'percent'
                    ? decimalToPercentage(region.indicatorValueRegional)
                    : region.indicatorValueRegional,
                tooltipValue: region.indicatorValueRegional,
                date: region.indicatorMonth,
                uncertainRange: [
                    negativeRange,
                    positiveRange,
                ],
                minimumValue: isDefined(region.indicatorValueRegional)
                    ? bound(region.indicatorValueRegional - region.errorMargin, 0, 1)
                    : undefined,
                maximumValue: isDefined(region.indicatorValueRegional)
                    ? bound(region.indicatorValueRegional + region.errorMargin, 0, 1)
                    : undefined,
                region: region.region,
                indicatorName: region.indicatorName,
                indicatorType: region.type,
                errorMargin: region.errorMargin,
                id: region.id,
                format: region.format as FormatType,
                subvariable: region.subvariable,
                interpolated: 0,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [overviewStatsResponse?.uncertaintyRegion]);

    const outbreakLineChart = useMemo(() => {
        const outbreakGlobal = overviewStatsResponse?.outbreak.map((outbreak) => (
            {
                id: outbreak.id,
                emergency: outbreak.emergency,
                contextDate: outbreak.indicatorMonth,
                format: outbreak.format,
                unformattedValue: outbreak.indicatorValueGlobal,
                [outbreak.emergency]: (outbreak.format === 'percent')
                    ? decimalToPercentage(outbreak.indicatorValueGlobal)
                    : outbreak.indicatorValueGlobal,
            }
        ));

        const outbreakRegion = overviewStatsResponse?.outbreakRegion.map((region) => (
            {
                id: region.id,
                emergency: region.emergency,
                contextDate: region.indicatorMonth,
                format: region.format,
                unformattedValue: region.indicatorValueRegional,
                [region.emergency]: (region.format === 'percent')
                    ? decimalToPercentage(region.indicatorValueRegional)
                    : region.indicatorValueRegional,
            }
        ));
        if (filterValues?.region) {
            return outbreakRegion;
        }
        return outbreakGlobal;
    }, [
        overviewStatsResponse?.outbreak,
        overviewStatsResponse?.outbreakRegion,
        filterValues?.region,
    ]);

    const renderLegend = useCallback((legendProps: LegendProps) => {
        const { payload } = legendProps;
        return (
            <>
                {payload?.map((entry) => (
                    <Element
                        key={`item - ${entry.id} `}
                        actions={(
                            <>
                                <IoSquare color={colors[filterValues?.outbreak ?? 'COVID-19']} />
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
    ]);

    const customRegionalTooltip = useCallback((tooltipProps: TooltipProps) => {
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
                    subHeading={`(${regionalData[0].payload?.indicatorMonth})`}
                    value={regionalData[0].payload?.indicatorValue}
                />
            );
        }
        return null;
    }, [
        filterValues?.indicator,
    ]);

    const customOutbreakTooltip = useCallback((outbreakTooltipProps: OutbreakTooltipProps) => {
        const {
            active,
            payload: outbreakData,
        } = outbreakTooltipProps;

        if (active && outbreakData) {
            return (
                <CustomTooltip
                    format={(outbreakData[0].payload?.format ?? 'raw') as FormatType}
                    heading={outbreakData[0].name}
                    subHeading={`(${outbreakData[0].payload?.contextDate})`}
                    value={outbreakData[0].payload?.unformattedValue}
                />
            );
        }
        return null;
    }, []);

    const globalRegionRendererParams = useCallback((_, data: GlobalRegionCard) => ({
        barName: filterValues?.subvariable === data.subvariable
            ? (<b>{data.subvariable}</b>) : data.subvariable,
        value: data.indicatorValue,
        format: data.format as FormatType,
        emergency: filterValues?.outbreak,
        totalValue: 1,
        color: '#98A6B5',
        valueTitle: data.subvariable,
    }), [
        filterValues?.subvariable,
        filterValues?.outbreak,
    ]);

    const headingDescription = useMemo((): string | undefined => {
        const isRegionSelected = isDefined(filterValues?.region);

        if (isRegionSelected) {
            // eslint-disable-next-line max-len
            const firstRegionalLevelSubvariable = overviewStatsResponse?.regionLevelSubvariables?.[0];
            if (isDefined(firstRegionalLevelSubvariable)) {
                return firstRegionalLevelSubvariable.indicatorDescription ?? selectedIndicatorName;
            }
            return selectedIndicatorName;
        }
        const firstGlobalLevelSubvariable = overviewStatsResponse?.globalLevelSubvariables?.[0];

        if (isDefined(firstGlobalLevelSubvariable)) {
            return firstGlobalLevelSubvariable.indicatorDescription ?? selectedIndicatorName;
        }
        return selectedIndicatorName;
    }, [
        filterValues?.region,
        overviewStatsResponse,
        selectedIndicatorName,
    ]);

    const tooltip = (
        <Tooltip>
            <div>
                {`Total: ${totalCaseValue
                    ? formatNumber(totalCaseFormat ?? 'raw' as const, totalCaseValue, false)
                    : 'N/a'}`}
            </div>
            <div>
                {`Date: ${percentageCardMonth ?? 'N/a'}`}
            </div>
            {uncertaintyRange && (
                <div>
                    {`Uncertainty Range: ${uncertaintyRange}`}
                </div>
            )}
        </Tooltip>
    );

    return (
        <div className={_cs(className, styles.cardInfo)}>
            {selectedIndicatorType === 'Social Behavioural Indicators'
                ? null
                : (
                    <PercentageStats
                        className={styles.globalStatCard}
                        heading={cardHeader}
                        headerDescription={selectedIndicatorName ?? ''}
                        headingSize="extraSmall"
                        statValue={totalCaseValue}
                        format={totalCaseFormat ?? 'raw' as const}
                        statValueLoading={loading}
                        indicatorMonth={percentageCardMonth}
                        uncertaintyRange={uncertaintyRange}
                    />
                )}
            {(selectedIndicatorType === 'Social Behavioural Indicators') && (
                <ContainerCard
                    className={styles.percentageCard}
                    heading={(
                        <>
                            <div className={styles.outbreakCard}>
                                Global
                            </div>
                            {tooltip}
                        </>
                    )}
                    headingSize="extraSmall"
                    headerDescription={headingDescription && (
                        <>
                            <div className={styles.outbreakCard}>
                                {`${headingDescription} - ${filterValues?.subvariable}`}
                            </div>
                            {tooltip}
                        </>
                    )}
                    contentClassName={styles.globalDetails}
                >
                    <ChartContainer
                        className={styles.globalChartContainer}
                        data={globalRegionCardList}
                        loading={loading}
                    >
                        <>
                            <div className={styles.globalValue}>
                                <>
                                    {selectedGlobalRegion?.indicatorValue
                                        ? formatNumber(
                                            totalCaseFormat as FormatType,
                                            totalCaseValue,
                                        )
                                        : 'N/a'}
                                    {tooltip}
                                </>
                            </div>
                            <ListView
                                className={styles.globalProgressBar}
                                renderer={ProgressBar}
                                keySelector={globalRegionKeySelector}
                                rendererParams={globalRegionRendererParams}
                                data={globalRegionCardList}
                                pending={loading}
                                errored={false}
                                filtered={false}
                            />
                        </>
                    </ChartContainer>
                </ContainerCard>
            )}
            {uncertaintyChartActive ? (
                <UncertaintyChart
                    uncertainData={
                        filterValues?.region
                            ? uncertaintyRegionChart
                            : uncertaintyGlobalChart
                    }
                    loading={loading}
                    emergencyFilterValue={filterValues?.outbreak}
                    heading="Indicator overview over the last 12 months"
                    headingDescription={`Trend chart for ${selectedIndicatorName ?? filterValues?.indicator} `}
                />
            ) : (
                <ContainerCard
                    className={styles.trendsCard}
                    headingClassName={styles.headingContent}
                    heading={selectedIndicatorType
                        ? 'Indicator overview over the last 12 months'
                        : 'Outbreak over the last 12 months'}
                    headingSize="extraSmall"
                    contentClassName={styles.responsiveContent}
                    headerDescription={outbreakSubHeader ?? ''}
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
                                tickMargin={10}
                                padding={{
                                    right: 30,
                                    left: 20,
                                }}
                                fontSize={10}
                                interval={0}
                                tickFormatter={dateTickFormatter}
                                angle={-30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                padding={{ top: 12 }}
                                tickFormatter={normalizedTickFormatter}
                                fontSize={12}
                            />
                            <ChartTooltip
                                content={customOutbreakTooltip}
                            />
                            <Legend content={renderLegend} />
                            <Line
                                type="monotone"
                                dataKey={filterValues?.outbreak}
                                stroke={colors[filterValues?.outbreak ?? 'COVID-19']}
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
                heading={regionTotalCase?.format === 'percent' ? 'Regional Percentage' : 'Regional Breakdown'}
                headingSize="extraSmall"
                headerDescription={filterValues?.indicator
                    ? `${selectedIndicatorName ?? '-'} `
                    : `New cases per million for ${selectedOutbreakName}`}
            >
                <ChartContainer
                    data={regionalBreakdownRegion}
                    loading={loading}
                    className={styles.responsiveContainer}
                >
                    <BarChart
                        data={regionalBreakdownRegion}
                        barSize={18}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={customRegionalTooltip}
                        />
                        <XAxis
                            dataKey="region"
                            tickLine={false}
                            fontSize={11}
                            tickMargin={10}
                            interval={0}
                            angle={-30}
                        />
                        <YAxis
                            padding={{ bottom: 0 }}
                            hide
                        />
                        <Bar
                            dataKey="indicatorValue"
                            radius={[10, 10, 0, 0]}
                        >
                            {regionalBreakdownRegion?.map((entry) => (
                                <Cell
                                    key={`Cell - ${entry.id} `}
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
            </ContainerCard>
        </div>
    );
}
export default PercentageCardGroup;
