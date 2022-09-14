import React, { useCallback, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
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

import { RegionalQuery, RegionalQueryVariables, TotalQuery, TotalQueryVariables } from '#generated/types';

import PieChartInfo, { RegionalDataType } from './PieChartInfo';
import { FilterType } from '../../Filters';
import styles from './styles.css';

const COLORS = ['#C09A57', '#FFDD98', '#C7BCA9', '#ACA28E', '#CCB387'];
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

type EpiDataGlobal = NonNullable<RegionalQuery>['epiDataGlobal'][number];

const REGIONAL_BREAKDOWN = gql`
    query Regional(
        $mostRecent: Boolean,
        $isGlobal: Boolean,
        $contextIndicatorId: String,
    ) {
        epiDataGlobal(
            filters: {
                mostRecent: $mostRecent,
                isGlobal: $isGlobal,
                contextIndicatorId: $contextIndicatorId,
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

const TOTAL_CASES = gql`
    query Total(
        $mostRecent: Boolean,
        $region: String,
        $isGlobal: Boolean,
        $contextIndicatorId: String,
    ) {
        epiDataGlobal(
            filters: {
                mostRecent: $mostRecent,
                region: $region,
                contextIndicatorId: $contextIndicatorId,
                isGlobal: $isGlobal
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

    const regionalVariables = useMemo((): RegionalQueryVariables => ({
        mostRecent: true,
        isGlobal: false,
        contextIndicatorId: 'total_cases',
    }), []);

    const {
        data: regionalResponse,
    } = useQuery<RegionalQuery, RegionalQueryVariables>(
        REGIONAL_BREAKDOWN,
        {
            variables: regionalVariables,
        },
    );

    const TotalCasesVariable = useMemo((): TotalQueryVariables => ({
        mostRecent: true,
        contextIndicatorId: 'total_cases',
        region: filterValues?.region,
        isGlobal: !filterValues?.region,
    }), [filterValues?.region]);

    const {
        data: totalCasesResponse,
    } = useQuery<TotalQuery, TotalQueryVariables>(
        TOTAL_CASES,
        {
            variables: TotalCasesVariable,
        },
    );

    const regionalPieChart = useMemo(() => {
        const groupedMap = listToGroupList(
            regionalResponse?.epiDataGlobal,
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
    }, [regionalResponse?.epiDataGlobal]);

    const regionalLabel = unique(
        regionalResponse?.epiDataGlobal ?? [],
        (item: EpiDataGlobal) => item.emergency,
    ).map((entry) => ({
        emergency: entry.emergency,
        fill: entry.emergency === 'Monkeypox' ? '#ACA28E' : '#FFDD98',
    }));

    const totalBarChart = totalCasesResponse?.epiDataGlobal.map((total) => (
        {
            ...total,
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
                heading="Total number of cases"
                headingSize="extraSmall"
                headerDescription="Loreum epsum epsum 2020"
            >
                <ResponsiveContainer className={styles.responsiveContainer}>
                    <BarChart
                        data={totalBarChart}
                        barSize={18}
                    >
                        <Tooltip
                            isAnimationActive={false}
                            allowEscapeViewBox={{
                                x: false,
                                y: false,
                            }}
                            cursor={false}
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
                                dataKey="contextIndicatorValue"
                                position="insideBottomLeft"
                                angle={270}
                                offset={-2.8}
                                fontSize={22}
                            />
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
                    data={regionalPieChart}
                    renderer={PieChartInfo}
                    rendererParams={pieChartInfoRendererParams}
                    filtered={false}
                    errored={false}
                    pending={false}
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
                />
            </ContainerCard>
        </div>
    );
}
export default RegionalBreakdownCard;
