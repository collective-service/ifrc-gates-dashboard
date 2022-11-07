import React, { useCallback, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LabelList,
    Cell,
} from 'recharts';
import {
    ContainerCard,
    ListView,
} from '@the-deep/deep-ui';
import {
    listToGroupList,
    mapToList,
    unique,
    _cs,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';

import {
    RegionalAndTotalQuery,
    RegionalAndTotalQueryVariables,
} from '#generated/types';
import {
    formatNumber,
    normalCommaFormatter,
    FormatType,
} from '#utils/common';
import ChartContainer from '#components/ChartContainer';
import CustomTooltip from '#components/CustomTooltip';

import PieChartInfo, { RegionalDataType } from './PieChartInfo';
import { FilterType } from '../../Filters';
import styles from './styles.css';

const pieChartInfoKeySelector = (d: PieChartInfoRendererProps) => d.region;
const regionalLabelKeySelector = (d: RegionalLabelRendererProps) => d.emergency;
export interface PieChartInfoRendererProps {
    region: string;
    regionalData?: RegionalDataType[];
}
export interface RegionalLabelRendererProps {
    emergency: string;
    fill: string;
}

type EpiDataGlobal = NonNullable<RegionalAndTotalQuery>['total'][number];

interface Payload {
    name?: string;
    value?: number;
    payload?: EpiDataGlobal;
}

interface TooltipProps {
    active?: false;
    payload?: Payload[]
    label?: string;
}

const REGIONAL_BREAKDOWN_TOTAL = gql`
    query RegionalAndTotal(
        $indicatorId: String,
    ) {
        total: globalLevel(
            filters: {
                indicatorId: $indicatorId
                category: "Global",
                isMostRecent: true,
            }
        ) {
            emergency
            id
            format
            indicatorValueGlobal
            indicatorMonth
        }

        regional: regionLevel(
            filters: {
                indicatorId: $indicatorId,
                category: "Global",
                isMostRecent: true
            }
        ) {
            emergency
            id
            format
            indicatorValueRegional
            indicatorMonth
            region
        }
    }
`;

function RegionalBreakdownLabel(props: RegionalLabelRendererProps) {
    const {
        fill,
        emergency,
    } = props;

    return (
        <div
            className={styles.breakdownLabel}
        >
            <div
                style={{
                    backgroundColor: fill,
                    width: 10,
                    height: 10,
                    borderRadius: 50,
                }}
            />
            <div className={styles.labelName}>
                {emergency}
            </div>
        </div>
    );
}

function CustomTotalTooltip(tooltipProps: TooltipProps) {
    const {
        active,
        payload: totalCases,
        label,
    } = tooltipProps;

    if (active && totalCases && totalCases.length > 0) {
        return (
            <CustomTooltip
                format="raw"
                heading={label}
                subHeading={`(${totalCases[0].payload?.indicatorMonth})`}
                value={totalCases[0].payload?.indicatorValueGlobal}

            />
        );
    }
    return null;
}

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
}

function RegionalBreakdownCard(props: Props) {
    const {
        className,
        filterValues,
    } = props;

    const regionalTotalVariable = useMemo((): RegionalAndTotalQueryVariables => ({
        indicatorId: filterValues?.indicator ?? 'new_cases_per_million',
    }), [filterValues?.indicator]);

    const {
        loading,
        previousData: previousRegionalData,
        data: regionalTotalResponse = previousRegionalData,
    } = useQuery<RegionalAndTotalQuery, RegionalAndTotalQueryVariables>(
        REGIONAL_BREAKDOWN_TOTAL,
        {
            variables: regionalTotalVariable,
        },
    );

    const regionalPieChart = useMemo(() => {
        const groupedMap = listToGroupList(
            regionalTotalResponse?.regional,
            (region) => region.region,
            (item) => ({
                emergency: item.emergency,
                fill: item.emergency === 'Monkeypox' ? '#ACA28E' : '#FFDD98',
                contextIndicatorValue: item.indicatorValueRegional,
                contextDate: item.indicatorMonth,
                format: item.format as FormatType,
                region: item.region,
            }),
        );

        return mapToList(
            groupedMap,
            (item, key) => ({
                region: key,
                regionalData: item,
                format: item[0].format as FormatType,
            }),
        );
    }, [regionalTotalResponse?.regional]);

    const regionalLabel = unique(
        regionalTotalResponse?.regional ?? [],
        (item: EpiDataGlobal) => item.emergency,
    ).map((entry) => ({
        emergency: entry.emergency,
        fill: entry.emergency === 'Monkeypox' ? '#ACA28E' : '#FFDD98',
    }));

    const totalBarChart = regionalTotalResponse?.total.map((total) => (
        {
            ...total,
            indicatorValue: Number(normalCommaFormatter().format(total.indicatorValueGlobal ?? 0)),
            normalizedValue: formatNumber(
                (total?.format ?? 'raw') as FormatType,
                total?.indicatorValueGlobal ?? 0,
            ),
            fill: total.emergency === 'Monkeypox' ? '#ACA28E' : '#FFDD98',
        }
    ));

    const pieChartInfoRendererParams = useCallback(
        (_: string, data: PieChartInfoRendererProps) => ({
            region: data.region,
            regionalData: data?.regionalData,
            filterValues,
        }), [filterValues],
    );

    const regionalLabelRendererParams = useCallback(
        (_: string, data: RegionalLabelRendererProps) => ({
            fill: data.fill,
            emergency: data.emergency,
        }), [],
    );

    return (
        <div className={_cs(className, styles.cardInfo)}>
            <ContainerCard
                className={_cs(styles.globalStatCard)}
                contentClassName={styles.responsiveContent}
                headingClassName={styles.headingContent}
                heading="Total number of cases"
                headingSize="extraSmall"
                headerDescription="Total number of cases by outbreak"
            >
                <ChartContainer
                    data={totalBarChart}
                    loading={loading}
                    className={styles.responsiveContainer}
                >
                    <BarChart
                        data={totalBarChart}
                        barSize={18}
                    >
                        <Tooltip
                            isAnimationActive={false}
                            cursor={false}
                            content={(<CustomTotalTooltip />)}
                            allowEscapeViewBox={{ x: true, y: false }}
                        />
                        <XAxis
                            dataKey="emergency"
                            tickLine={false}
                        >
                            <LabelList
                                dataKey="emergency"
                                position="bottom"
                                fontSize="10"
                            />
                        </XAxis>
                        <YAxis
                            padding={{ bottom: 12 }}
                            hide
                        />
                        <Bar
                            dataKey="indicatorValueGlobal"
                            name="Number of Cases"
                            isAnimationActive={false}
                            radius={[10, 10, 0, 0]}
                        >
                            {totalBarChart?.map((entry) => (
                                <Cell
                                    key={`Cell -${entry.id}`}
                                    fill={entry.fill}
                                />
                            ))}
                            <LabelList
                                dataKey="normalizedValue"
                                position="insideBottomLeft"
                                angle={270}
                                offset={-2.8}
                                fontSize={22}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </ContainerCard>
            <ContainerCard
                className={_cs(styles.regionsPieChart)}
                contentClassName={styles.responsiveContent}
                headingClassName={styles.headingContent}
                heading="Regional Breakdown"
                headingSize="extraSmall"
                headerDescription={`Repartition of cases by ${filterValues?.region ?? 'region'}`}
            >
                <ChartContainer
                    data={regionalPieChart}
                    loading={loading}
                    className={styles.responsiveContainer}
                >
                    <>
                        <ListView
                            className={styles.pieChartCollection}
                            keySelector={pieChartInfoKeySelector}
                            data={regionalPieChart}
                            renderer={PieChartInfo}
                            rendererParams={pieChartInfoRendererParams}
                            filtered={false}
                            errored={false}
                            compactPendingMessage
                            pending={loading}
                        />
                        <ListView
                            className={styles.breakdownLabelWrapper}
                            keySelector={regionalLabelKeySelector}
                            data={regionalLabel}
                            renderer={RegionalBreakdownLabel}
                            rendererParams={regionalLabelRendererParams}
                            filtered={false}
                            errored={false}
                            pending={false}
                            compactPendingMessage
                        />
                    </>
                </ChartContainer>
            </ContainerCard>
        </div>
    );
}
export default RegionalBreakdownCard;
