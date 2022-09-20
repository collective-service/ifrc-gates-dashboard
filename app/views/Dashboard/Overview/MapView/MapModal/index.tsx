import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    listToGroupList,
    mapToList,
    unique,
    compareDate,
} from '@togglecorp/fujs';
import {
    Modal,
    Heading,
    Button,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import { BiLinkExternal } from 'react-icons/bi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import {
    IoInformationCircle,
} from 'react-icons/io5';
import {
    getShortMonth,
    normalFormatter,
} from '#utils/common';
import { FilterType } from '#views/Dashboard/Filters';
import { TabTypes } from '#views/Dashboard';
import {
    CountryModalQuery,
    CountryModalQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const dateTickFormatter = (d: string) => getShortMonth(d);
const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

const COUNTRY_PROFILE = gql`
    query CountryModal(
        $iso3: String,
        $contextIndicatorId: String!,
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
                isTwelveMonth: $isTwelveMonth,
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
        ContextualDataWithMultipleEmergency(
            iso3: $iso3,
        ) {
            emergency
            data {
              contextIndicatorValue
              contextDate
              id
              contextIndicatorId
            }
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

    const handleModalCountryName = useCallback(() => {
        const isoName = countryData?.properties?.iso3;
        setActiveTab('country');
        setFilterValues({ country: isoName });
    }, [
        countryData,
        setActiveTab,
        setFilterValues,
    ]);

    const emergencyLineChart = useMemo(() => {
        const emergencyMapList = countryResponse?.ContextualDataWithMultipleEmergency.map(
            (emergency) => {
                const emergencyGroupList = listToGroupList(
                    emergency.data,
                    (date) => date.contextDate ?? '',
                );
                return mapToList(
                    emergencyGroupList,
                    (group, key) => group.reduce(
                        (acc, item) => ({
                            ...acc,
                            [emergency.emergency]: item.contextIndicatorValue,
                            date: item.contextDate,
                        }), { date: key },
                    ),
                ).sort((a, b) => compareDate(a.date, b.date));
            },
        ).flat();

        const emergencyGroupedList = listToGroupList(
            emergencyMapList,
            (month) => month.date,
        );

        return Object.values(emergencyGroupedList ?? {}).map(
            (d) => d.reduce((acc, item) => ({ ...acc, ...item }), {}),
        );
    }, [countryResponse?.ContextualDataWithMultipleEmergency]);

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
                        {normalizedTickFormatter(countryResponse?.countryProfile?.totalCases ?? 0)}
                    </Heading>
                    <Heading
                        className={styles.countrySurveyDate}
                    >
                        Nov, 2022 Fake
                    </Heading>
                </div>
            )}
            footer={(
                <div className={styles.perceptionCard}>
                    <div className={styles.infoIcon}>
                        <IoInformationCircle />
                    </div>
                    &nbsp;
                    <div>
                        {`COVID-19 Vaccine Perceptions in ${countryResponse?.countryProfile.countryName}
                    (${countryResponse?.countryProfile.countryName} CDC)`}
                    </div>
                    &nbsp;
                    &nbsp;
                    <a
                        href="https://www.rcce-collective.net/data/data-tracker/"
                        className={styles.infoIcon}
                    >
                        <BiLinkExternal />
                    </a>
                </div>
            )}
        >
            <ResponsiveContainer className={styles.responsiveContainer}>
                <LineChart
                    data={emergencyLineChart}
                    margin={{
                        right: 10,
                    }}
                >
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        padding={{ left: 28 }}
                        tickFormatter={dateTickFormatter}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        padding={{ top: 5 }}
                        tickFormatter={normalizedTickFormatter}
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
