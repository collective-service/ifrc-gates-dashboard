import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    listToGroupList,
    mapToList,
    unique,
    compareDate,
    isNotDefined,
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
import {
    decimalToPercentage,
    getShortMonth,
    negativeToZero,
    normalFormatter,
    positiveToZero,
} from '#utils/common';
import { FilterType } from '#views/Dashboard/Filters';
import { TabTypes } from '#views/Dashboard';
import UncertaintyChart, { UncertainData } from '#components/UncertaintyChart';
import Sources from '#components/Sources';
import {
    CountryModalQuery,
    CountryModalQueryVariables,
    SubvariablesQuery,
    SubvariablesQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const dateTickFormatter = (d: string) => getShortMonth(d);
const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

const SUBVARIABLES = gql`
    query Subvariables(
        $iso3: String!,
        $indicatorId:String
    ) {
        filterOptions {
            subvariables(iso3: $iso3, indicatorId: $indicatorId)
        }
    }
`;

const COUNTRY_PROFILE = gql`
    query CountryModal(
        $iso3: String,
        $emergency: String,
        $subvariable: String,
        $indicatorId: String,
    ) {
        countryProfile(iso3: $iso3) {
            iso3
            countryName
            totalCases
        }
        contextualData(
            filters: {
                iso3: $iso3,
                contextIndicatorId:"total_cases",
                emergency: $emergency,
                isTwelveMonth: true,
            }
            order: {
                contextDate: DESC,
            }
            pagination: {
                limit: 12,
                offset: 0,
            }
        ) {
            id
            iso3
            emergency
            contextIndicatorId
            contextIndicatorValue
            contextDate
        }
        contextualDataWithMultipleEmergency(
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
        dataCountryLevel(
            filters: {
                isTwelveMonth: true
                iso3: $iso3,
                subvariable: $subvariable,
                indicatorId: $indicatorId,
                category: "Global",
                emergency: $emergency,
            }
            pagination: {
                limit: 12,
                offset: 0,
            }
        ) {
            errorMargin
            indicatorName
            indicatorValue
            indicatorMonth
            indicatorDescription
            indicatorId
            subvariable
            interpolated
            emergency
        }
    }
`;

interface ModalProps {
    className?: string;
    onModalClose: () => void;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    countryData: mapboxgl.MapboxGeoJSONFeature | undefined;
    filterValues: FilterType | undefined;
    selectedIndicatorName: string | undefined;
}

function MapModal(props: ModalProps) {
    const {
        className,
        onModalClose,
        setActiveTab,
        setFilterValues,
        countryData,
        filterValues,
        selectedIndicatorName,
    } = props;

    const subvariablesVariables = useMemo(() => (
        {
            iso3: countryData?.properties?.iso3 ?? 'AFG',
            indicatorId: filterValues?.indicator,
        }
    ), [
        countryData?.properties?.iso3,
        filterValues?.indicator,
    ]);

    const {
        data: subVariableList,
    } = useQuery<SubvariablesQuery, SubvariablesQueryVariables>(
        SUBVARIABLES,
        {
            skip: !filterValues?.indicator,
            variables: subvariablesVariables,
        },
    );

    const countryVariables = useMemo((): CountryModalQueryVariables => ({
        iso3: countryData?.properties?.iso3 ?? 'AFG',
        emergency: filterValues?.outbreak,
        indicatorId: filterValues?.indicator,
        subvariable: subVariableList?.filterOptions.subvariables[0],
    }
    ), [
        countryData,
        subVariableList,
        filterValues?.outbreak,
        filterValues?.indicator,
    ]);

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
        const emergencyMapList = countryResponse?.contextualDataWithMultipleEmergency.map(
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
                            [emergency.emergency]: Number(item.contextIndicatorValue),
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
    }, [countryResponse?.contextualDataWithMultipleEmergency]);

    const latestDate: { date?: string } = emergencyLineChart[emergencyLineChart.length - 1];

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

    const uncertaintyChart: UncertainData[] | undefined = useMemo(() => (
        countryResponse?.dataCountryLevel.map((country) => {
            const negativeRange = negativeToZero(country.indicatorValue, country.errorMargin);
            const positiveRange = positiveToZero(country.indicatorValue, country.errorMargin);

            if (isNotDefined(country.errorMargin)) {
                return {
                    emergency: country.emergency,
                    indicatorValue: decimalToPercentage(country.indicatorValue),
                    tooltipValue: country.indicatorValue,
                    date: country.indicatorMonth,
                };
            }

            if (country.interpolated) {
                return {
                    emergency: country.emergency,
                    date: country.indicatorMonth,
                    uncertainRange: [
                        negativeRange ?? 0,
                        positiveRange ?? 0,
                    ],
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                };
            }
            return {
                emergency: country.emergency,
                indicatorValue: decimalToPercentage(country.indicatorValue),
                tooltipValue: country.indicatorValue,
                date: country.indicatorMonth,
                uncertainRange: [
                    negativeRange ?? 0,
                    positiveRange ?? 0,
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [countryResponse?.dataCountryLevel]);

    const latestIndicatorValue = useMemo(() => {
        if (!uncertaintyChart) {
            return undefined;
        }
        return uncertaintyChart[uncertaintyChart?.length - 1];
    }, [uncertaintyChart]);

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
                        {
                            filterValues?.indicator
                                ? `${latestIndicatorValue?.indicatorValue
                                    ? latestIndicatorValue?.indicatorValue
                                    : 0}%`
                                : normalizedTickFormatter(
                                    countryResponse?.countryProfile?.totalCases ?? 0,
                                )
                        }
                    </Heading>
                    <Heading
                        className={styles.countrySurveyDate}
                    >
                        {
                            filterValues?.indicator
                                ? dateTickFormatter(latestIndicatorValue?.date ?? '')
                                : dateTickFormatter(latestDate?.date ?? '')
                        }
                    </Heading>
                </div>
            )}
            footer={(
                <Sources
                    country={countryData?.properties?.iso3 ?? 'AFG'}
                    emergency={filterValues?.outbreak}
                    indicatorId={filterValues?.indicator}
                    subvariable={subVariableList?.filterOptions.subvariables[0]}
                />
            )}
        >
            {!filterValues?.indicator && (
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
            )}
            {(uncertaintyChart?.length ?? 0) > 0 && filterValues?.indicator && (
                <UncertaintyChart
                    uncertainData={(uncertaintyChart && uncertaintyChart) ?? []}
                    emergencyFilterValue={filterValues?.outbreak}
                    heading="Indicator overview over the last 12 months"
                    headingDescription={`Trend chart for ${selectedIndicatorName ?? filterValues?.indicator}`}
                />
            )}
        </Modal>
    );
}
export default MapModal;
