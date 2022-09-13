import React from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    ResponsiveContainer,
    Pie,
    PieChart,
    Cell,
} from 'recharts';

import { FilterType } from '../../../Filters';
import styles from './styles.css';

// TODO: TO remove after completion
const COLORS = ['#C09A57', '#FFDD98', '#C7BCA9', '#ACA28E', '#CCB387'];

export type RegionalDataType = {
    fill: string;
    emergency: string;
    contextIndicatorValue: number | null | undefined;
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
                <ResponsiveContainer
                    className={styles.responsiveContainer}
                >
                    <PieChart
                        width={20}
                        height={5}
                    >
                        <Pie
                            data={regionalData}
                            dataKey="contextIndicatorValue"
                            labelLine={false}
                            cx={60}
                            cy={50}
                            outerRadius={40}
                        >
                            {regionalData?.map((entry) => (
                                <Cell
                                    key={`Cell -${entry.emergency}`}
                                    fill={entry.fill}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
export default PieChartInfo;
