import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    Pie,
    PieChart,
    Cell,
    Tooltip,
} from 'recharts';

import ChartContainer from '#components/ChartContainer';
import { formatNumber, FormatType } from '#utils/common';

import { FilterType } from '../../../Filters';
import styles from './styles.css';

export type RegionalDataType = {
    fill: string;
    emergency: string;
    contextIndicatorValue?: number | null;
    format?: string;
    region?: string;
    contextDate?: string;
}

interface PieChartInfoProps {
    className?: string;
    region?: string;
    regionalData?: RegionalDataType[];
    filterValues?: FilterType | undefined;
}
interface Payload {
    name?: string;
    value?: number;
    payload?: RegionalDataType;
}
interface TooltipProps {
    active?: boolean;
    payload?: Payload[];
}

function PieChartInfo(props: PieChartInfoProps) {
    const {
        className,
        region,
        regionalData,
        filterValues,
    } = props;

    const isRegionSelected = isDefined(filterValues?.region);

    const selectedRegion = filterValues?.region?.toLowerCase() === region?.toLowerCase();

    const customPieChartTooltip = (tooltipProps: TooltipProps) => {
        const {
            active,
            payload: pieData,
        } = tooltipProps;
        if (active && pieData) {
            return (
                <div className={styles.tooltipCard}>
                    <div className={styles.tooltipHeading}>
                        {pieData[0].payload?.region}
                    </div>
                    <div className={styles.tooltipContent}>
                        {`(${pieData[0].payload?.contextDate})`}
                    </div>
                    <div className={styles.tooltipContent}>
                        {` ${pieData[0].payload?.emergency} - ${formatNumber(pieData[0].payload?.format as FormatType,
                            pieData[0].payload?.contextIndicatorValue ?? 0)}`}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={_cs(
                className, styles.pieChartWrapper,
                isRegionSelected && styles.lessOpacity,
            )}
            style={{ opacity: (selectedRegion || !isRegionSelected) ? 1 : 0.2 }}
        >
            <div className={styles.pieChartHeader}>
                {region}
            </div>
            <div className={styles.pieChartHolder}>
                <ChartContainer
                    data={regionalData}
                    className={styles.responsiveContainer}
                >
                    <PieChart
                        width={20}
                        height={5}
                    >
                        <Pie
                            data={regionalData}
                            dataKey="contextIndicatorValue"
                            nameKey="emergency"
                            labelLine={false}
                            cx="50%"
                            cy="50%"
                            outerRadius={40}
                        >
                            {regionalData?.map((entry) => (
                                <Cell
                                    key={`Cell -${entry.emergency}`}
                                    fill={entry.fill}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            allowEscapeViewBox={{
                                x: true,
                                y: true,
                            }}
                            content={customPieChartTooltip}
                        />
                    </PieChart>
                </ChartContainer>
            </div>
        </div>
    );
}
export default PieChartInfo;
