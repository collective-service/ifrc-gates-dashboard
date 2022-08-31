import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
    Heading,
} from '@the-deep/deep-ui';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts';
import { IoInformationCircleOutline } from 'react-icons/io5';

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
            size="medium"
            heading="<--Country Name-->"
            headingDescription={(
                <div className={styles.modalDescription}>
                    <Heading
                        size="extraLarge"
                        className={styles.countryCaseData}
                    >
                        132M
                    </Heading>
                    <Heading
                        className={styles.countrySurveyDate}
                    >
                        Nov, 2022
                    </Heading>
                </div>
            )}
            footer={(
                <text>
                    <IoInformationCircleOutline />
                    COVID-19 Vaccine Perceptions in | CountryName | 2021-02-01
                </text>
            )}
        >
            <ResponsiveContainer className={styles.responsiveContainer}>
                <LineChart
                    data={lineChartData}
                    margin={{
                        right: 10,
                        left: -20,
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
                        padding={{ top: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="MonkeyPox"
                        stroke="#C09A57"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="Covid"
                        stroke="#FFDD98"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="Ebola"
                        stroke="#C7BCA9"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Modal>
    );
}
export default MapModal;
