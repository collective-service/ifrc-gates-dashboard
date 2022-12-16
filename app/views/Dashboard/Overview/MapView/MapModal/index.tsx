import React, { useCallback, useMemo } from 'react';
import { BiLinkExternal } from 'react-icons/bi';
import {
    _cs,
    listToGroupList,
    mapToList,
    listToMap,
    unique,
    compareDate,
    isNotDefined,
    compareNumber,
    bound,
    isDefined,
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
    Legend,
    Tooltip,
} from 'recharts';
import {
    decimalToPercentage,
    FormatType,
    getShortMonth,
    normalFormatter,
    colors,
    negativeToZero,
    positiveToZero,
    normalizedValue,
} from '#utils/common';
import { FilterType } from '#views/Dashboard/Filters';
import {
    TabTypes,
    IndicatorType,
} from '#views/Dashboard';
import UncertaintyChart, { UncertainData } from '#components/UncertaintyChart';
import Sources from '#components/Sources';
import ChartContainer from '#components/ChartContainer';
import {
    CountryModalQuery,
    CountryModalQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const dateTickFormatter = (d: string) => getShortMonth(d, 'numeric');
const normalizedTickFormatter = (d: number) => normalFormatter().format(d);

interface TooltipProps {
    active?: boolean;
    payload?: {
        name?: string;
        value?: number;
        payload?: {
            date: string;
            id: string;
            format: string;
        };
    }[];
}

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
            newCasesPerMillion
        }
        contextualData(
            filters: {
                iso3: $iso3,
                contextIndicatorId: "new_cases_per_million",
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
            contextIndicatorId: "new_cases_per_million",
        ) {
            emergency
            data {
              contextIndicatorValue
              contextDate
              id
              contextIndicatorId
              format
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
            format
        }
    }
`;

interface ModalProps {
    className?: string;
    onModalClose: () => void;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    countryData: { iso3: string; name: string };
    indicatorMonth?: string;
    format?: FormatType;
    indicatorValue?: number;
    indicatorId: string;
    outbreakId: string | undefined;
    indicatorExplicitlySet: boolean;
    selectedIndicatorType: IndicatorType | undefined;
    filterValues?: FilterType;
}

function MapModal(props: ModalProps) {
    const {
        className,
        onModalClose,
        setActiveTab,
        setFilterValues,
        countryData,
        indicatorMonth,
        format,
        indicatorValue,
        indicatorId,
        outbreakId,
        selectedIndicatorType,
        indicatorExplicitlySet,
        filterValues,
    } = props;

    const countryVariables = useMemo((): CountryModalQueryVariables => ({
        iso3: countryData.iso3,
        emergency: outbreakId,
        indicatorId,
        subvariable: filterValues?.subvariable,
    }
    ), [
        countryData,
        outbreakId,
        indicatorId,
        filterValues?.subvariable,
    ]);

    const {
        data: countryResponse,
        loading: countryResponseLoading,
    } = useQuery<CountryModalQuery, CountryModalQueryVariables>(
        COUNTRY_PROFILE,
        {
            variables: countryVariables,
        },
    );

    const emergencyLineChart = useMemo(
        () => {
            if (filterValues?.outbreak) {
                const emergencyTrend = countryResponse?.dataCountryLevel;
                if (!emergencyTrend) {
                    return undefined;
                }
                return emergencyTrend.map(
                    (emergencyDatum) => ({
                        date: emergencyDatum.indicatorMonth,
                        format: emergencyDatum.format,
                        [emergencyDatum.emergency]: emergencyDatum.format === 'percent'
                            ? decimalToPercentage(emergencyDatum.indicatorValue)
                            : emergencyDatum.indicatorValue,
                    }),
                ).sort((foo, bar) => compareDate(foo.date, bar.date));
            }
            const emergencies = countryResponse?.contextualDataWithMultipleEmergency;
            if (!emergencies) {
                return [];
            }
            const flattenedEmergencies = emergencies.flatMap(
                (emergency) => emergency.data.map(
                    (emergencyDatum) => ({
                        ...emergencyDatum,
                        emergency: emergency.emergency,
                    }),
                ),
            );

            const formatForMultipleEmergencies = (flattenedEmergencies.map(
                (item) => item.format,
            )?.[0] as FormatType | undefined) ?? 'raw';

            const emergenciesByDate = listToGroupList(
                flattenedEmergencies,
                (emergency) => emergency.contextDate,
            );

            return mapToList(
                emergenciesByDate,
                (emergenciesForDate, key) => ({
                    date: key,
                    format: formatForMultipleEmergencies,
                    ...listToMap(
                        emergenciesForDate,
                        (emergency) => emergency.emergency,
                        (emergency) => (formatForMultipleEmergencies === 'percent'
                            ? decimalToPercentage(emergency.contextIndicatorValue)
                            : emergency.contextIndicatorValue),
                    ),
                }),
            ).sort((foo, bar) => compareDate(foo.date, bar.date));
        },
        [
            countryResponse,
            filterValues,
        ],
    );

    const outbreaks = useMemo(() => (
        unique(
            countryResponse?.contextualData ?? [],
            (d) => d.emergency,
        ).map((item) => ({
            emergency: item.emergency,
            fill: colors[item.emergency] ?? '#FFDD98',
        }))
    ), [countryResponse?.contextualData]);

    const uncertaintyChart: UncertainData[] | undefined = useMemo(() => (
        countryResponse?.dataCountryLevel.map((country) => {
            const negativeRange = negativeToZero(country.indicatorValue, country.errorMargin);
            const positiveRange = positiveToZero(country.indicatorValue, country.errorMargin);

            if (isNotDefined(country.errorMargin)) {
                return {
                    emergency: country.emergency,
                    indicatorValue: country.format === 'percent'
                        ? decimalToPercentage(country.indicatorValue)
                        : country.indicatorValue,
                    tooltipValue: country.indicatorValue,
                    date: country.indicatorMonth,
                    indicatorName: country.indicatorName,
                    format: country.format as FormatType,
                    interpolated: country.interpolated,
                    subvariable: country.subvariable,
                };
            }

            return {
                emergency: country.emergency,
                indicatorValue: country.format === 'percent'
                    ? decimalToPercentage(country.indicatorValue)
                    : country.indicatorValue,
                tooltipValue: country.indicatorValue,
                date: country.indicatorMonth,
                // FIXME : Solve the issue of negativeToZero and positiveToZero
                uncertainRange: [
                    negativeRange ?? 0,
                    positiveRange ?? 0,
                ],
                minimumValue: isDefined(country.indicatorValue)
                    ? bound(country.indicatorValue - country.errorMargin, 0, 1)
                    : undefined,
                maximumValue: isDefined(country.indicatorValue)
                    ? bound(country.indicatorValue + country.errorMargin, 0, 1)
                    : undefined,
                indicatorName: country.indicatorName,
                format: country.format as FormatType,
                interpolated: country.interpolated,
                subvariable: country.subvariable,
            };
        }).filter(isDefined).sort((a, b) => compareDate(a.date, b.date))
    ), [countryResponse?.dataCountryLevel]);

    const customOutbreakTooltip = useCallback((tooltipProps: TooltipProps) => {
        const {
            active,
            payload,
        } = tooltipProps;

        const outbreakData = payload?.map((load) => ({
            ...load,
            id: `${load.payload?.id}-${load.value}`,
        })).sort((a, b) => compareNumber(b.value, a.value));

        if (!active || !outbreakData) {
            return null;
        }

        return (
            <div className={styles.tooltipCard}>
                {outbreakData.map((item) => (
                    <div key={item.id}>
                        <div className={styles.tooltipHeading}>
                            {item.name}
                        </div>
                        {item.payload?.date && (
                            <div className={styles.tooltipContent}>
                                {`(${item.payload.date})`}
                            </div>
                        )}
                        <div className={styles.tooltipContent}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        );
    }, []);

    const handleModalCountryNameClick = useCallback(() => {
        setActiveTab('country');
        setFilterValues((old) => ({
            ...old,
            country: countryData.iso3,
        }));
    }, [
        countryData,
        setActiveTab,
        setFilterValues,
    ]);

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            className={_cs(className, styles.mapModal)}
            backdropClassName={styles.backdrop}
            size="large"
            heading={(
                <Button
                    name={undefined}
                    onClick={handleModalCountryNameClick}
                    variant="action"
                    actions={<BiLinkExternal />}
                    actionsContainerClassName={styles.countryLinkIcon}
                >
                    {countryData.name}
                </Button>
            )}
            headingDescription={(
                <div className={styles.modalDescription}>
                    <Heading
                        size="extraLarge"
                        className={styles.countryCaseData}
                    >
                        {normalizedValue(
                            indicatorValue,
                            format as FormatType,
                        )}
                    </Heading>
                    <Heading
                        className={styles.countrySurveyDate}
                    >
                        {indicatorMonth
                            ? dateTickFormatter(indicatorMonth)
                            : undefined}
                    </Heading>
                </div>
            )}
            freeHeight
        >
            {(!indicatorExplicitlySet || selectedIndicatorType === 'Contextual Indicators') ? (
                <>
                    <Heading
                        size="extraSmall"
                    >
                        {
                            filterValues?.indicator
                                ? 'Indicator overview over the last 12 months'
                                : 'Outbreaks overview over the last 12 months'

                        }
                    </Heading>
                    <div className={styles.chartContainer}>
                        <ChartContainer
                            data={emergencyLineChart}
                            loading={countryResponseLoading}
                        >
                            <LineChart
                                data={emergencyLineChart}
                                margin={{
                                    right: 10,
                                }}
                            >
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    padding={{
                                        right: 30,
                                        left: 20,
                                    }}
                                    fontSize={12}
                                    interval={0}
                                    angle={-30}
                                    tickMargin={10}
                                    tickFormatter={dateTickFormatter}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={12}
                                    tickFormatter={normalizedTickFormatter}
                                    padding={{
                                        top: 5,
                                        bottom: 10,
                                    }}
                                />
                                <Legend
                                    iconType="rect"
                                    align="right"
                                    verticalAlign="bottom"
                                    iconSize={14}
                                    wrapperStyle={{
                                        paddingTop: 20,
                                    }}
                                />
                                <Tooltip
                                    content={customOutbreakTooltip}
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
                        </ChartContainer>
                    </div>
                </>
            ) : (
                <UncertaintyChart
                    className={styles.chartContainer}
                    loading={countryResponseLoading}
                    uncertainData={uncertaintyChart}
                    emergencyFilterValue={outbreakId}
                    heading="Indicator overview over the last 12 months"
                />
            )}
            <Sources
                className={styles.sources}
                country={countryData.iso3}
                emergency={outbreakId}
                indicatorId={indicatorExplicitlySet ? indicatorId : undefined}
                subvariable={indicatorExplicitlySet ? filterValues?.subvariable : undefined}
            />
        </Modal>
    );
}
export default MapModal;
