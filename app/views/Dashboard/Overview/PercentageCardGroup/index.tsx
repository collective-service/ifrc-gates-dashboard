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
    AliasQuery,
    AliasQueryVariables,
} from '#generated/types';

import { FilterType } from '../../Filters';

import styles from './styles.css';

const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

const customLabel = (val: number | string | undefined) => (
    `${val}%`
);

const ALIAS = gql`
    query Alias(
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

function PercentageCardGroup(props: Props) {
    const {
        className,
        uncertaintyChartActive,
        filterValues,
        selectedIndicatorName,
        selectedOutbreakName,
    } = props;

    const aliasVariables = useMemo((): AliasQueryVariables => ({
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
        data: aliasResponse,
    } = useQuery<AliasQuery, AliasQueryVariables>(
        ALIAS,
        {
            variables: aliasVariables,
        },
    );

    const regionalBreakdownRegion = useMemo(() => (
        aliasResponse?.regionalBreakdownRegion.map((region) => (
            {
                id: region.id,
                contextIndicatorValue: decimalToPercentage(region.indicatorValueRegional),
                indicatorMonth: region.indicatorMonth,
                region: region.region,
            }
        ))
    ), [aliasResponse?.regionalBreakdownRegion]);

    const regionalBreakdownGlobal = useMemo(() => (
        aliasResponse?.regionalBreakdownGlobal.map((region) => (
            {
                ...region,
                normalizedValue: normalFormatter().format(region.contextIndicatorValue ?? 0),
            }
        )).filter((item) => item.region !== 'Global')
    ), [aliasResponse?.regionalBreakdownGlobal]);

    const uncertaintyGlobalChart = useMemo(() => (
        aliasResponse?.uncertaintyGlobal.map((global) => {
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
                    negativeRange ?? 0,
                    positiveRange ?? 0,
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [aliasResponse?.uncertaintyGlobal]);

    const uncertaintyRegionChart = useMemo(() => (
        aliasResponse?.uncertaintyRegion.map((region) => {
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
                    negativeRange ?? 0,
                    positiveRange ?? 0,
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [aliasResponse?.uncertaintyRegion]);

    const outbreakLineChart = useMemo(() => (
        aliasResponse?.outbreak.map((outbreak) => (
            {
                id: outbreak.id,
                emergency: outbreak.emergency,
                contextDate: getShortMonth(outbreak.contextDate),
                [outbreak.emergency]: outbreak.contextIndicatorValue,
            }
        ))
    ), [aliasResponse?.outbreak]);

    const totalCase = useMemo(() => (
        aliasResponse?.totalCases
            .find(
                (emergency) => emergency.emergency === filterValues?.outbreak,
            )
    ), [
        aliasResponse?.totalCases,
        filterValues?.outbreak,
    ]);

    const globalTotalCase = useMemo(() => (
        aliasResponse?.totalCasesGlobal
            .find(
                (global) => global.indicatorId === filterValues?.indicator,
            )
    ), [
        aliasResponse?.totalCasesGlobal,
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
                    ? `Number of cases for ${selectedIndicatorName ?? filterValues.indicator}`
                    : `Number of cases for ${selectedOutbreakName ?? filterValues?.outbreak}`}
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    {(filterValues?.indicator)
                        ? (
                            <BarChart
                                data={regionalBreakdownRegion}
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
                                    fontSize={12}
                                />
                                <YAxis
                                    padding={{ bottom: 0 }}
                                    hide
                                />
                                <Bar
                                    dataKey="contextIndicatorValue"
                                    fill="#8DD2B1"
                                    radius={[10, 10, 0, 0]}
                                >
                                    {regionalBreakdownRegion?.map((entry) => (
                                        <Cell
                                            key={`Cell -${entry.id}`}
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
                                    allowEscapeViewBox={{
                                        x: true,
                                        y: true,
                                    }}
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
                                    fill="#8DD2B1"
                                    radius={[10, 10, 0, 0]}
                                >
                                    {regionalBreakdownGlobal?.map((entry) => (
                                        <Cell
                                            key={`Cell -${entry.id}`}
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
