import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    listToGroupList,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import {
    Modal,
    Heading,
    Button,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import { IoInformationCircleOutline } from 'react-icons/io5';
import {
    getShortMonth,
} from '#utils/common';
import { FilterType } from '#views/Dashboard/Filters';
import { TabTypes } from '#views/Dashboard';
import {
    CountryModalQuery,
    CountryModalQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const COUNTRY_PROFILE = gql`
    query CountryModal(
        $iso3: String,
        $contextIndicatorId: String!,
        $emergency: String,
        $isTwelveMonth: Boolean,
    ) {
        countryProfile(iso3: $iso3) {
            iso3
            countryName
            totalCases
        }
        contextualData(
            filters: {
                iso3: $iso3,
                contextIndicatorId:$contextIndicatorId,
                emergency: $emergency,
                isTwelveMonth: $isTwelveMonth,
            }
            pagination: {
                limit: 12,
                offset: 0
            }
            order: {
                contextIndicatorValue: DESC,
            }
        ) {
            iso3
            emergency
            contextIndicatorId
            contextIndicatorValue
            contextDate
        }
    }
`;

interface ModalProps {
    className?: string;
    onModalClose: () => void;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    countryData: mapboxgl.MapboxGeoJSONFeature | undefined;
}

function MapModal(props: ModalProps) {
    const {
        className,
        onModalClose,
        setActiveTab,
        setFilterValues,
        countryData,
    } = props;

    const countryVariables = useMemo((): CountryModalQueryVariables => ({
        iso3: countryData?.properties?.iso3 ?? 'AFG',
        contextIndicatorId: 'total_cases',
        isTwelveMonth: true,
    }), [],
    );

    const {
        data: countryResponse,
    } = useQuery<CountryModalQuery, CountryModalQueryVariables>(
        COUNTRY_PROFILE,
        {
            variables: countryVariables,
        },
    );
    console.log('Modal info::>>', countryResponse);

    const handleModalCountryName = useCallback(() => {
        const isoName = countryData?.properties?.iso3;
        setActiveTab('country');
        setFilterValues({ country: isoName });
    }, [
        countryData,
        setActiveTab,
        setFilterValues,
    ]);

    const outbreakLineChartData = useMemo(() => {
        const outbreakGroupList = listToGroupList(
            countryResponse?.contextualData,
            (date) => date.contextDate ?? '',
        );
        return mapToList(outbreakGroupList,
            (group, key) => group.reduce(
                (acc, item) => ({
                    ...acc,
                    [item.emergency]: item.contextIndicatorValue,
                    date: getShortMonth(item.contextDate),
                }), { date: key },
            ));
    }, [countryResponse?.contextualData]);

    const outbreaks = useMemo(() => (
        unique(
            countryResponse?.contextualData ?? [],
            (d) => d.emergency,
        ).map((item) => {
            const colors: Record<string, string> = {
                'COVID-19': '#FFDD98',
                Monkeypox: '#ACA28E',
            };

            return ({
                emergency: item.emergency,
                fill: colors[item.emergency] ?? '#FFDD98',
            });
        })
    ), [countryResponse?.contextualData]);

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
                    {
                        // FIXME: here "idmc_short" should be replaced with some other name
                        countryData?.properties?.idmc_short
                    }
                </Button>
            )}
            headingDescription={(
                <div className={styles.modalDescription}>
                    <Heading
                        size="extraLarge"
                        className={styles.countryCaseData}
                    >
                        {countryResponse?.countryProfile?.totalCases}
                    </Heading>
                    <Heading
                        className={styles.countrySurveyDate}
                    >
                        Nov, 2022 Fake
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
                    data={outbreakLineChartData}
                    margin={{
                        right: 10,
                        left: -20,
                    }}
                >
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        padding={{ left: 20 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        padding={{ top: 5 }}
                    />
                    <Tooltip />
                    <Legend
                        iconType="rect"
                        align="right"
                        verticalAlign="bottom"
                    />
                    {outbreaks.map((outbreak) => (
                        <Line
                            key={outbreak.emergency}
                            dataKey={outbreak.emergency}
                            type="monotone"
                            stroke={outbreak.fill}
                            strokeWidth={3}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Modal>
    );
}
export default MapModal;
