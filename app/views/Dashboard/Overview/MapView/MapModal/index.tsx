import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
    Heading,
    Button,
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

import { FilterType } from '../../../Filters';
import styles from './styles.css';

export type TabTypes = 'country' | 'overview' | 'combinedIndicators';
interface ModalProps {
    className?: string;
    onModalClose: () => void;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
}

function MapModal(props: ModalProps) {
    const {
        className,
        onModalClose,
        setActiveTab,
        setFilterValues,
    } = props;

    const handleModalCountryName = useCallback(() => {
        setActiveTab('country');
        setFilterValues({ country: 'AFG' });
    }, [
        setActiveTab,
        setFilterValues,
    ]);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            className={_cs(className, styles.responsiveContent)}
            size="medium"
            heading={(
                <Button
                    name="map_modal"
                    onClick={handleModalCountryName}
                    variant="action"
                >
                    Afganisthan
                </Button>
            )}
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
