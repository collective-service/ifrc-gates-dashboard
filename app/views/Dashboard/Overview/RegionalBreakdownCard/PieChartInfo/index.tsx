import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ResponsiveContainer,
    Pie,
    PieChart,
    Cell,
} from 'recharts';

import styles from './styles.css';

const COLORS = ['#4D6F8B', '#AED8F1', '#7FAEDA', '#D0EFF2', '#B5CFD1'];

export type RegionalDataType = {
    id: number;
    status: string;
    percentage: number;
}

interface PieChartInfoProps {
    className?: string;
    id: string;
    country?: string;
    regionalData?: RegionalDataType[];
}

function PieChartInfo(props: PieChartInfoProps) {
    const {
        className,
        id,
        country,
        regionalData,
    } = props;

    return (
        <div
            key={id}
            className={_cs(className, styles.pieChartWrapper)}
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
                        height={50}
                    >
                        <Pie
                            data={regionalData}
                            dataKey="percentage"
                            labelLine={false}
                            cx={60}
                            cy={60}
                            outerRadius={50}
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
