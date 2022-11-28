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
    formatNumber,
    FormatType,
    getShortMonth,
    normalFormatter,
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
    CountrySubvariablesQuery,
    CountrySubvariablesQueryVariables,
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

const COUNTRY_SUBVARIABLES = gql`
    query CountrySubvariables(
        $iso3: String!,
        $indicatorId: String!,
    ) {
        filterOptions {
            subvariables(
                iso3: $iso3,
                indicatorId: $indicatorId,
            )
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
    } = props;

    const subvariablesVariables = useMemo(() => (
        {
            iso3: countryData.iso3,
            indicatorId,
        }
    ), [countryData, indicatorId]);

    const {
        data: subVariableList,
    } = useQuery<CountrySubvariablesQuery, CountrySubvariablesQueryVariables>(
        COUNTRY_SUBVARIABLES,
        {
            variables: subvariablesVariables,
        },
    );

    // FIXME: why use the first one only
    const subvariableId = subVariableList?.filterOptions.subvariables[0];

    const countryVariables = useMemo((): CountryModalQueryVariables => ({
        iso3: countryData.iso3,
        emergency: outbreakId,
        indicatorId,
        subvariable: subvariableId,
    }
    ), [
        countryData,
        outbreakId,
        indicatorId,
        subvariableId,
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

    // FIXME: this looks too complicated
    const emergencyLineChart = useMemo(() => {
        const emergencyMapList = countryResponse?.contextualDataWithMultipleEmergency.map(
            (emergency) => {
                const emergencyGroupList = listToGroupList(
                    emergency.data,
                    (data) => data.contextDate,
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
                        }),
                        { date: key },
                    ),
                ).sort((a, b) => compareDate(a.date, b.date));
            },
        ).flat();

        const emergencyGroupedList = listToGroupList(
            emergencyMapList,
            (data) => data.date,
        );

        return Object.values(emergencyGroupedList ?? {}).map(
            (d) => d.reduce((acc, item) => ({ ...acc, ...item }), {}),
        );
    }, [countryResponse?.contextualDataWithMultipleEmergency]);

    const outbreaks = useMemo(() => (
        unique(
            countryResponse?.contextualData ?? [],
            (d) => d.emergency,
        ).map((item) => {
            // FIXME: where are the other outbreaks?
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
            if (isNotDefined(country.indicatorValue)) {
                return undefined;
            }

            let negativeRange;
            let positiveRange;
            let uncertainRange;

            if (country.errorMargin) {
                negativeRange = decimalToPercentage(
                    bound(country.indicatorValue - country.errorMargin, 0, 1),
                );
                positiveRange = decimalToPercentage(
                    bound(country.indicatorValue + country.errorMargin, 0, 1),
                );
                uncertainRange = [negativeRange, positiveRange];
            }

            const numFormat = country.format as FormatType;

            return {
                emergency: country.emergency,
                indicatorValue: numFormat === 'percent'
                    ? decimalToPercentage(country.indicatorValue)
                    : country.indicatorValue,
                tooltipValue: country.indicatorValue,
                date: country.indicatorMonth,

                uncertainRange,
                minimumValue: negativeRange,
                maximumValue: positiveRange,

                indicatorName: country.indicatorName,
                format: numFormat,
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
                            {formatNumber('raw', item.value ?? 0)}
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
                        {formatNumber(
                            format as FormatType,
                            indicatorValue,
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
                subvariable={indicatorExplicitlySet ? subvariableId : undefined}
            />
        </Modal>
    );
}
export default MapModal;
