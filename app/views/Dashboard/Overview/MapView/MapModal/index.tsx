import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
    ContainerCard,
} from '@the-deep/deep-ui';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    lineChartData,
} from '#utils/dummyData';

import styles from './styles.css';

interface ModalProps {
    className?: string;
    onModalClose: () => void;
}

function MapModal(props: ModalProps) {
    const {
        className,
        onModalClose,
    } = props;

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            className={_cs(className, styles.responsiveContent)}
            heading="Country Name"
            headingDescription={(
                <div>
                    Total amount  --Year
                </div>
            )}
            size="small"
        >
            <ResponsiveContainer className={styles.responsiveContainer}>
                <LineChart
                    data={lineChartData}
                    margin={{
                        right: 10,
                    }}
                >
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        padding={{ left: 20 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        padding={{ top: 18 }}
                    />
                    <Legend
                        iconType="square"
                        align="center"
                    />
                    <Line
                        type="monotone"
                        dataKey="MonkeyPox"
                        stroke="#4bda8a"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="Covid"
                        stroke="#2169bb"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Modal>
    );
}
export default MapModal;
