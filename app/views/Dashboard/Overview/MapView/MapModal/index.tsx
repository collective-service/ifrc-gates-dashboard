import React, { useCallback, useMemo } from 'react';
import { BiLinkExternal } from 'react-icons/bi';
import {
    _cs,
    listToGroupList,
    mapToList,
    unique,
    compareDate,
    isNotDefined,
    compareNumber,
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
    formatNumber,
    FormatType,
    getShortMonth,
    negativeToZero,
    normalFormatter,
    positiveToZero,
} from '#utils/common';
import { FilterType } from '#views/Dashboard/Filters';
import { TabTypes } from '#views/Dashboard';
import UncertaintyChart, { UncertainData } from '#components/UncertaintyChart';
import Sources from '#components/Sources';
import ChartContainer from '#components/ChartContainer';
import {
    CountryModalQuery,
    CountryModalQueryVariables,
    SubvariablesQuery,
    SubvariablesQueryVariables,
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
interface CountryWiseOutbreakCases {
    id: string;
    emergency?: string;
    indicatorMonth?: string;
    totalCases?: string | null;
}

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
            newCasesPerMillion
        }
        contextualData(
            filters: {
                iso3: $iso3,
                contextIndicatorId:"new_cases_per_million",
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
        totalCases: dataCountryLevelMostRecent(
            filters: {
                indicatorId: "new_cases_per_million",
                iso3: $iso3,
            }
        ) {
            indicatorValue
            indicatorMonth
            emergency
            format
            id
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
        indicatorId: filterValues?.indicator ?? 'new_cases_per_million',
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
        loading: countryResponseLoading,
    } = useQuery<CountryModalQuery, CountryModalQueryVariables>(
        COUNTRY_PROFILE,
        {
            variables: countryVariables,
        },
    );

    const handleModalCountryNameClick = useCallback(() => {
        setActiveTab('country');
        setFilterValues((old) => ({
            ...old,
            country: countryData?.properties?.iso3,
        }));
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
                            format: item.format,
                            id: item.id,
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

    const countryWiseOutbreakCases: CountryWiseOutbreakCases[] | undefined = useMemo(() => (
        countryResponse?.totalCases.map((total) => (
            {
                id: total.id,
                emergency: total.emergency,
                indicatorMonth: total.indicatorMonth,
                totalCases: formatNumber(
                    total.format as FormatType,
                    total.indicatorValue,
                ),
            }
        ))
    ), [countryResponse]);

    const numberOfCases = useMemo(() => {
        if (isNotDefined(countryWiseOutbreakCases)) {
            return undefined;
        }
        return countryWiseOutbreakCases.find(
            (item) => item.emergency === filterValues?.outbreak,
        );
    }, [
        filterValues?.outbreak,
        countryWiseOutbreakCases,
    ]);

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
                    // FIXME : solve in common ts
                    minimumValue: negativeRange ?? 0,
                    maximumValue: positiveRange,
                    indicatorName: country.indicatorName,
                    format: country.format as FormatType,
                };
            }
            return {
                emergency: country.emergency,
                indicatorValue: country.format === 'percent'
                    ? decimalToPercentage(country.indicatorValue)
                    : country.indicatorValue,
                tooltipValue: country.indicatorValue,
                date: country.indicatorMonth,
                uncertainRange: [
                    negativeRange ?? 0,
                    positiveRange ?? 0,
                ],
                // FIXME : solve in common ts
                minimumValue: negativeRange ?? 0,
                maximumValue: positiveRange,
                indicatorName: country.indicatorName,
                format: country.format as FormatType,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [countryResponse?.dataCountryLevel]);

    const latestIndicatorValue = useMemo(() => {
        if (!uncertaintyChart) {
            return undefined;
        }
        return uncertaintyChart[uncertaintyChart?.length - 1];
    }, [uncertaintyChart]);

    const date = useMemo(() => {
        if (filterValues?.indicator) {
            return latestIndicatorValue?.date;
        }

        if (!filterValues?.indicator && filterValues?.outbreak) {
            return numberOfCases?.indicatorMonth;
        }
        return latestDate?.date;
    }, [
        filterValues?.indicator,
        filterValues?.outbreak,
        latestIndicatorValue?.date,
        numberOfCases?.indicatorMonth,
        latestDate,
    ]);

    const totalCasesHeading = useMemo(() => {
        if (filterValues?.indicator) {
            return (formatNumber(
                latestIndicatorValue?.format as FormatType,
                latestIndicatorValue?.tooltipValue,
            ));
        }

        if (!filterValues?.indicator && filterValues?.outbreak) {
            return numberOfCases?.totalCases;
        }
        return formatNumber(
            'raw' as FormatType,
            countryResponse?.countryProfile?.newCasesPerMillion ?? 0,
        );
    }, [
        countryResponse?.countryProfile?.newCasesPerMillion,
        numberOfCases?.totalCases,
        filterValues?.indicator,
        filterValues?.outbreak,
        latestIndicatorValue?.format,
        latestIndicatorValue?.tooltipValue,
    ]);

    const customOutbreakTooltip = (tooltipProps: TooltipProps) => {
        const {
            active,
            payload,
        } = tooltipProps;

        const outbreakData = payload?.map((load) => ({
            ...load,
            id: `${load.payload?.id}-${load.value}`,
        })).sort((a, b) => compareNumber(b.value, a.value));

        if (active && outbreakData) {
            return (
                <div className={styles.tooltipCard}>
                    {outbreakData.map((item) => (
                        <div key={item.id}>
                            <div className={styles.tooltipHeading}>
                                {item.name}
                            </div>
                            <div className={styles.tooltipContent}>
                                {`(${item.payload?.date})`}
                            </div>
                            <div className={styles.tooltipContent}>
                                {formatNumber('raw' as FormatType, item.value ?? 0)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Modal
            onCloseButtonClick={onModalClose}
            className={_cs(className, styles.mapModal)}
            size="large"
            heading={(
                <Button
                    name={undefined}
                    onClick={handleModalCountryNameClick}
                    variant="action"
                    actions={<BiLinkExternal />}
                    actionsContainerClassName={styles.countryLinkIcon}
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
                        {totalCasesHeading}
                    </Heading>
                    <Heading
                        className={styles.countrySurveyDate}
                    >
                        {date ? dateTickFormatter(date) : undefined}
                    </Heading>
                </div>
            )}
            freeHeight
        >
            {!filterValues?.indicator && (
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
                                padding={{ left: 28 }}
                                tickFormatter={dateTickFormatter}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                padding={{ top: 5 }}
                                tickFormatter={normalizedTickFormatter}
                            />
                            <Legend
                                iconType="rect"
                                align="right"
                                verticalAlign="bottom"
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
            )}
            {filterValues?.indicator && (
                <UncertaintyChart
                    className={styles.chartContainer}
                    loading={countryResponseLoading}
                    uncertainData={(uncertaintyChart && uncertaintyChart) ?? []}
                    emergencyFilterValue={filterValues?.outbreak}
                    heading="Indicator overview over the last 12 months"
                    headingDescription={`Trend chart for ${selectedIndicatorName ?? filterValues?.indicator}`}
                />
            )}
            <Sources
                className={styles.sources}
                country={countryData?.properties?.iso3 ?? 'AFG'}
                emergency={filterValues?.outbreak}
                indicatorId={filterValues?.indicator}
                subvariable={subVariableList?.filterOptions.subvariables[0]}
            />
        </Modal>
    );
}
export default MapModal;
