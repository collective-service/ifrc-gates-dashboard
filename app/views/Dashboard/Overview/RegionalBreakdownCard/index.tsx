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
    normalFormatter,
    normalCommaFormatter,
} from '#utils/common';
import ChartContainer from '#components/ChartContainer';

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

interface CustomProps {
    active?: false;
    payload?: {
        value?: number;
    }[];
    label?: string;
}

function CustomTooltip(customProps: CustomProps) {
    const { active, payload, label } = customProps;

    if (active && payload && payload.length > 0) {
        return (
            <div>
                <p>{`${label} : ${normalCommaFormatter().format(payload[0]?.value ?? 0)}`}</p>
            </div>
        );
    }
    return null;
}

const REGIONAL_BREAKDOWN_TOTAL = gql`
    query RegionalAndTotal(
        $region: String,
        $isGlobal: Boolean,
    ) {
        total: epiDataGlobal(
        filters: {
            mostRecent: true,
            region: $region,
            contextIndicatorId: "total_cases",
            isGlobal: $isGlobal,
        }
        ) {
            region
            contextIndicatorValue
            mostRecent
            emergency
            id
        }
        regional: epiDataGlobal(
        filters: {
            mostRecent: true,
            isGlobal: false,
            contextIndicatorId: "total_cases"
        }
        ) {
            region
            contextIndicatorValue
            mostRecent
            emergency
            id
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

interface RegionalBreakdownCardProps {
    className?: string;
    filterValues?: FilterType | undefined;
}

function RegionalBreakdownCard(props: RegionalBreakdownCardProps) {
    const {
        className,
        filterValues,
    } = props;

    const regionalTotalVariable = useMemo((): RegionalAndTotalQueryVariables => ({
        region: filterValues?.region,
        isGlobal: !filterValues?.region,
    }), [filterValues?.region]);

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
                contextIndicatorValue: item.contextIndicatorValue,
            }),
        );

        return mapToList(
            groupedMap,
            (item, key) => ({
                region: key,
                regionalData: item,
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
            indicatorValue: Number(normalCommaFormatter().format(total.contextIndicatorValue ?? 0)),
            normalizedValue: normalFormatter().format(total.contextIndicatorValue ?? 0),
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
                            content={(<CustomTooltip />)}
                            isAnimationActive={false}
                            cursor={false}
                            allowEscapeViewBox={{ x: true, y: true }}
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
                            dataKey="contextIndicatorValue"
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
                headerDescription="Repartition of cases by region"
            >
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
            </ContainerCard>
        </div>
    );
}
export default RegionalBreakdownCard;
