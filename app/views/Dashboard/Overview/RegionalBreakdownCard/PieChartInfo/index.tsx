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

const COLORS = ['#C09A57', '#FFDD98', '#C7BCA9', '#ACA28E', '#CCB387'];

export type RegionalDataType = {
    id: number;
    status: string;
    percentage: number;
}

interface PieChartInfoProps {
    className?: string;
    country?: string;
    regionalData?: RegionalDataType[];
    filterValues?: FilterType | undefined;
}

function PieChartInfo(props: PieChartInfoProps) {
    const {
        className,
        country,
        regionalData,
        filterValues,
    } = props;

    const isRegionSelected = isDefined(filterValues?.region);

    const selectedRegion = filterValues?.region?.toLowerCase() === country?.toLowerCase();

    return (
        <div
            className={_cs(
                className, styles.pieChartWrapper,
                isRegionSelected && styles.lessOpacity,
            )}
            style={{ opacity: (selectedRegion || !isRegionSelected) ? 1 : 0.2 }}
        >
            <div className={styles.pieChartHeader}>
                {country}
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
                            dataKey="percentage"
                            labelLine={false}
                            cx={60}
                            cy={50}
                            outerRadius={40}
                        >
                            {regionalData?.map((entry) => (
                                <Cell
                                    key={`Cell -${entry.id}`}
                                    fill={COLORS[entry.id % COLORS.length]}
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
