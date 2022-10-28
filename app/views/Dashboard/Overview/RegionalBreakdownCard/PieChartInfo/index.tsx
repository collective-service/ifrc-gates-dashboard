import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import { NumberOutput } from '@the-deep/deep-ui';
import {
    Pie,
    PieChart,
    Cell,
    Tooltip,
} from 'recharts';

import ChartContainer from '#components/ChartContainer';

import { FilterType } from '../../../Filters';
import styles from './styles.css';

export type RegionalDataType = {
    fill: string;
    emergency: string;
    contextIndicatorValue: number | null | undefined;
}

interface LabelProps {
    x: number;
    y: number;
    value: string;
}

interface PieChartInfoProps {
    className?: string;
    region?: string;
    regionalData?: RegionalDataType[];
    filterValues?: FilterType | undefined;
}

function PieChartInfo(props: PieChartInfoProps) {
    const {
        className,
        region,
        regionalData,
        filterValues,
    } = props;

    const isRegionSelected = isDefined(filterValues?.region);
    const aggregatedValue = (labelProps: LabelProps) => {
        const { x, y, value } = labelProps;

        return (
            <text
                x={x}
                y={y}
                dy={-4}
            >
                <NumberOutput
                    normal
                    value={Number(value)}
                />
            </text>
        );
    };

    const selectedRegion = filterValues?.region?.toLowerCase() === region?.toLowerCase();

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
                            label={aggregatedValue}
                        />
                    </PieChart>
                </ChartContainer>
            </div>
        </div>
    );
}
export default PieChartInfo;
