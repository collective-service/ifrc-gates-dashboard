import React, { useCallback, useMemo } from 'react';
import {
    isNotDefined,
    listToGroupList,
    _cs,
    mapToList,
    unique,
    compareDate,
    isDefined,
    compareNumber,
} from '@togglecorp/fujs';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
    BarChart,
    Bar,
} from 'recharts';
import {
    ContainerCard,
    TextOutput,
    ListView,
    NumberOutput,
    PendingMessage,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import UncertaintyChart, { UncertainData } from '#components/UncertaintyChart';
import PercentageStats from '#components/PercentageStats';
import ScoreCard from '#components/ScoreCard';
import ChartContainer from '#components/ChartContainer';
import CustomTooltip from '#components/CustomTooltip';

import {
    decimalToPercentage,
    formatNumber,
    FormatType,
    getShortMonth,
    negativeToZero,
    normalCommaFormatter,
    normalFormatter,
    positiveToZero,
} from '#utils/common';
import {
    CountryQuery,
    CountryQueryVariables,
} from '#generated/types';
import Sources from '#components/Sources';

import { FilterType } from '../Filters';

import styles from './styles.css';

interface ScoreCardProps {
    title: string;
    value?: number;
    date?: string;
    source?: string;
    indicator?: 'red' | 'yellow' | 'orange' | 'green';
}
interface CountryWiseOutbreakCases {
    id: string;
    emergency?: string;
    totalCases?: number | null;
    totalDeaths?: string | null;
    newCases?: string | null;
    newDeaths?: string | null;
    newCasesPerMillion?: string | null;
    newDeathsPerMillion?: string | null;
}

const dateTickFormatter = (d: string) => getShortMonth(d);
const normalizedTickFormatter = (d: number) => normalFormatter().format(d);
const percentageKeySelector = (d: CountryWiseOutbreakCases) => d.id;
const readinessKeySelector = (d: ScoreCardProps) => d.title;
const customLabel = (val: number | string | undefined) => (
    `${val}%`
);

function metricTypeForColor(data: ScoreCardProps) {
    if (isNotDefined(data) || isNotDefined(data.value)) {
        return undefined;
    }
    if (data.value > 75) {
        return 'green' as const;
    }
    if ((data.value <= 75) && (data.value > 50)) {
        return 'yellow' as const;
    }
    if ((data.value <= 50) && (data.value > 25)) {
        return 'orange' as const;
    }
    return 'red' as const;
}

const COUNTRY_PROFILE = gql`
    query Country(
        $iso3: String,
        $requiredIso3: String!,
        $emergency: String,
        $subvariable: String,
        $indicatorId: String,
    ) {
        countryProfile(iso3: $iso3) {
            iso3
            countryName
            populationSize
            region
            readiness
            readinessDate
            readinessSource
            vulnerability
            vulnerabilityDate
            vulnerabilitySource
            risk
            riskDate
            riskSource
            response
            responseDate
            responseSource
            stringency
            stringencyRegion
            stringencyFormat
            economicSupportIndex
            economicSupportIndexRegion
            medicalStaff
            medicalStaffRegion
            medicalStaffFormat
            literacyRate
            literacyRateRegion
            literacyRateFormat
            internetAccess
            internetAccessRegion
            internetAccessFormat
            washAccessNational
            washAccessNationalRegion
            washAccessNationalFormat
            newCasesPerMillion
            newCasesRegionShare
            newDeaths
        }
        disaggregation {
            ageDisaggregation(
                iso3: $requiredIso3,
                indicatorId: $indicatorId,
                subvariable: $subvariable,
            ) {
                category
                indicatorValue
                format
            }
            genderDisaggregation(
                iso3: $requiredIso3,
                indicatorId: $indicatorId,
                subvariable: $subvariable,
            ) {
                category
                indicatorValue
                format
            }
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
        newDeaths: dataCountryLevelMostRecent(
            filters: {
                indicatorId: "new_deaths",
                iso3: $iso3,
            }
        ) {
            indicatorValue
            emergency
            format
            id
        }
        totalDeaths: dataCountryLevelMostRecent(
            filters: {
                indicatorId: "total_deaths",
                iso3: $iso3,
            }
        ) {
            indicatorValue
            emergency
            format
            id
        }
        newCases: dataCountryLevelMostRecent(
            filters: {
                indicatorId: "new_cases",
                iso3: $iso3,
            }
        ) {
            indicatorValue
            emergency
            format
            id
        }
        newDeathsPerMillion: dataCountryLevelMostRecent(
            filters: {
                indicatorId: "new_deaths_per_million",
                iso3: $iso3,
            }
        ) {
            indicatorValue
            emergency
            format
            id
        }
        newCasesPerMillion: dataCountryLevelMostRecent(
            filters: {
                indicatorId: "new_cases_per_million",
                iso3: $iso3,
            }
        ) {
            indicatorValue
            emergency
            format
            id
        }
        totalCases: dataCountryLevelMostRecent(
            filters: {
                indicatorId: "total_cases",
                iso3: $iso3,
            }
        ) {
            indicatorValue
            emergency
            format
            id
        }
        dataCountryLevelMostRecent (
            filters: {
                iso3: $iso3,
                indicatorId: $indicatorId,
                category: "Global",
                emergency: $emergency,
            }
            order: {
                indicatorMonth: DESC
            }
        ) {
            indicatorDescription
            indicatorMonth
            indicatorValue
        }
    }
`;

interface Payload {
    name?: string;
    value?: number;
    payload?: {
        date: string;
        id: string;
        format: string;
    };
}
interface TooltipProps {
    active?: boolean;
    payload?: Payload[];
}

interface DisaggregationTooltipProps {
    active?: boolean;
    payload?: {
        name: string;
        payload?: {
            format?: FormatType;
            category?: string;
            value?: number;
        };
    }[];
}

function CustomDisaggregationTooltip(disaggregationTooltipProps: DisaggregationTooltipProps) {
    const {
        active,
        payload,
    } = disaggregationTooltipProps;

    if (active && payload && payload.length > 0) {
        const format = payload[0]?.payload?.format as FormatType;
        return (
            <CustomTooltip
                format={format}
                heading={payload[0]?.payload?.category}
                value={payload[0]?.payload?.value}
            />
        );
    }
    return null;
}

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    selectedIndicatorName: string | undefined;
}

function Country(props: Props) {
    const {
        filterValues,
        className,
        selectedIndicatorName,
    } = props;

    const countryVariables = useMemo((): CountryQueryVariables => ({
        iso3: filterValues?.country ?? 'AFG',
        requiredIso3: filterValues?.country ?? 'AFG',
        emergency: filterValues?.outbreak,
        subvariable: filterValues?.subvariable,
        indicatorId: filterValues?.indicator,
    }), [
        filterValues?.country,
        filterValues?.outbreak,
        filterValues?.indicator,
        filterValues?.subvariable,
    ]);

    const {
        data: countryResponse,
        loading: countryResponseLoading,
    } = useQuery<CountryQuery, CountryQueryVariables>(
        COUNTRY_PROFILE,
        {
            variables: countryVariables,
        },
    );

    const internetAccess = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.internetAccess)
            && countryResponse?.countryProfile.internetAccess !== null)
            ? formatNumber(
                (countryResponse?.countryProfile.internetAccessFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile.internetAccess,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.internetAccess,
        countryResponse?.countryProfile.internetAccessFormat,
    ]);

    const literacyRate = useMemo(() => (
        (isDefined(countryResponse?.countryProfile?.literacyRate)
            && countryResponse?.countryProfile?.literacyRate !== null)
            ? formatNumber(
                (countryResponse?.countryProfile?.literacyRateFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile.literacyRate,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.literacyRate,
        countryResponse?.countryProfile.literacyRateFormat,
    ]);

    const washAccessNational = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.washAccessNational)
            && countryResponse?.countryProfile.washAccessNational !== null)
            ? formatNumber(
                (countryResponse?.countryProfile?.washAccessNationalFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile.washAccessNational,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.washAccessNational,
        countryResponse?.countryProfile.washAccessNationalFormat,
    ]);

    const stringency = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.stringency)
            && countryResponse?.countryProfile.stringency !== null)
            ? formatNumber(
                (countryResponse?.countryProfile?.stringencyFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile.stringency,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.stringency,
        countryResponse?.countryProfile.stringencyFormat,
    ]);

    const medicalStaff = useMemo(() => (
        (isDefined(countryResponse?.countryProfile?.medicalStaff)
            && countryResponse?.countryProfile?.medicalStaff !== null)
            ? formatNumber(
                (countryResponse?.countryProfile?.medicalStaffFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile?.medicalStaff,
            )
            : undefined
    ), [
        countryResponse?.countryProfile?.medicalStaff,
        countryResponse?.countryProfile?.medicalStaffFormat,
    ]);

    const medicalStaffRegional = useMemo(() => (
        (isDefined(countryResponse?.countryProfile?.medicalStaffRegion)
            && countryResponse?.countryProfile?.medicalStaffRegion !== null)
            ? formatNumber(
                (countryResponse?.countryProfile?.medicalStaffFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile?.medicalStaffRegion,
            )
            : undefined
    ), [
        countryResponse?.countryProfile?.medicalStaffRegion,
        countryResponse?.countryProfile?.medicalStaffFormat,
    ]);

    // TODO: use format from server
    const economicSupportIndex = useMemo(() => (
        (isDefined(countryResponse?.countryProfile?.economicSupportIndex)
            && countryResponse?.countryProfile?.economicSupportIndex !== null)
            ? formatNumber(
                'percent',
                countryResponse?.countryProfile?.economicSupportIndex,
            )
            : undefined
    ), [countryResponse?.countryProfile.economicSupportIndex]);

    // TODO: use format from server
    const economicSupportIndexRegion = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.economicSupportIndexRegion)
            && countryResponse?.countryProfile.economicSupportIndexRegion !== null)
            ? formatNumber(
                'percent',
                countryResponse?.countryProfile.economicSupportIndexRegion,
            )
            : undefined
    ), [countryResponse?.countryProfile.economicSupportIndexRegion]);

    const stringencyRegion = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.stringencyRegion)
            && countryResponse?.countryProfile.stringencyRegion !== null)
            ? formatNumber(
                (countryResponse?.countryProfile?.stringencyFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile.stringencyRegion,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.stringencyRegion,
        countryResponse?.countryProfile.stringencyFormat,
    ]);

    const washAccessNationalRegion = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.washAccessNationalRegion)
            && countryResponse?.countryProfile.washAccessNationalRegion !== null)
            ? formatNumber(
                (countryResponse?.countryProfile.washAccessNationalFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile.washAccessNationalRegion,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.washAccessNationalRegion,
        countryResponse?.countryProfile.washAccessNationalFormat,
    ]);

    const literacyRateRegion = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.literacyRateRegion)
            && countryResponse?.countryProfile.literacyRateRegion !== null)
            ? formatNumber(
                (countryResponse?.countryProfile?.literacyRateFormat) as FormatType,
                countryResponse?.countryProfile.literacyRateRegion,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.literacyRateRegion,
        countryResponse?.countryProfile.literacyRateFormat,
    ]);

    const internetAccessRegion = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.internetAccessRegion)
            && countryResponse?.countryProfile.internetAccessRegion !== null)
            ? formatNumber(
                (countryResponse?.countryProfile.internetAccessFormat ?? 'raw') as FormatType,
                countryResponse?.countryProfile.internetAccessRegion,
            )
            : undefined
    ), [
        countryResponse?.countryProfile.internetAccessRegion,
        countryResponse?.countryProfile.internetAccessFormat,
    ]);

    // TODO: Use format from server
    const regional = useMemo(() => (
        (isDefined(countryResponse?.countryProfile.newCasesRegionShare)
            && countryResponse?.countryProfile.newCasesRegionShare !== null)
            ? formatNumber(
                'percent',
                countryResponse?.countryProfile?.newCasesRegionShare,
            )
            : undefined
    ), [countryResponse?.countryProfile.newCasesRegionShare]);

    const totalNumberOfCases: CountryWiseOutbreakCases[] | undefined = useMemo(() => {
        const countryWiseOutbreakCases = countryResponse?.totalCases.map((total) => {
            const totalDeaths = countryResponse.totalDeaths.find(
                (deaths) => deaths.emergency === total.emergency,
            );

            const newCases = countryResponse.newCases.find(
                (cases) => cases.emergency === total.emergency,
            );

            const newDeaths = countryResponse.newDeaths.find(
                (death) => death.emergency === total.emergency,
            );

            const newCasesPerMillion = countryResponse.newCasesPerMillion.find(
                (million) => million.emergency === total.emergency,
            );

            const newDeathsPerMillion = countryResponse.newDeathsPerMillion.find(
                (million) => million.emergency === total.emergency,
            );

            return {
                id: total.id,
                emergency: total.emergency,
                totalCases: total.indicatorValue,
                totalDeaths: formatNumber(
                    totalDeaths?.format as FormatType,
                    totalDeaths?.indicatorValue,
                ),
                newCases: formatNumber(
                    newCases?.format as FormatType,
                    newCases?.indicatorValue,
                ),
                newDeaths: formatNumber(
                    newDeaths?.format as FormatType,
                    newDeaths?.indicatorValue,
                ),
                newCasesPerMillion: formatNumber(
                    newCasesPerMillion?.format as FormatType,
                    newCasesPerMillion?.indicatorValue,
                ),
                newDeathsPerMillion: formatNumber(
                    newDeathsPerMillion?.format as FormatType,
                    newDeathsPerMillion?.indicatorValue,
                ),
            };
        });

        if (filterValues?.outbreak) {
            if (!countryWiseOutbreakCases) {
                return undefined;
            }
            const outbreakWiseTotalCase = countryWiseOutbreakCases?.find(
                (cases) => cases.emergency === filterValues?.outbreak,
            );
            if (!outbreakWiseTotalCase) {
                return undefined;
            }
            return [outbreakWiseTotalCase];
        }

        return countryWiseOutbreakCases;
    }, [countryResponse]);

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
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
                    indicatorName: country.indicatorName,
                    format: country.format as FormatType,
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
                indicatorName: country.indicatorName,
                format: country.format as FormatType,
            };
        }).sort((a, b) => compareDate(a.date, b.date))
    ), [countryResponse?.dataCountryLevel]);

    const statusUncertainty = useMemo(() => {
        const dataCountryLevel = countryResponse?.dataCountryLevelMostRecent;
        if (!dataCountryLevel) {
            return undefined;
        }
        const getLatestUncertain = [...dataCountryLevel].sort(
            (a, b) => compareDate(b.indicatorMonth, a.indicatorMonth),
        );
        return getLatestUncertain[0];
    }, [countryResponse?.dataCountryLevelMostRecent]);

    const ageDisaggregation = useMemo(() => countryResponse
        ?.disaggregation.ageDisaggregation.map((age) => (
            {
                category: age.category,
                indicatorValue: decimalToPercentage(age.indicatorValue),
                value: age.indicatorValue,
                format: age.format as FormatType,
            }
        )), [countryResponse?.disaggregation.ageDisaggregation]);

    const genderDisaggregation = useMemo(() => countryResponse
        ?.disaggregation.genderDisaggregation.map((gender) => (
            {
                category: gender.category,
                indicatorValue: decimalToPercentage(gender.indicatorValue),
                format: gender.format as FormatType,
                value: gender.indicatorValue,
            }
        )), [countryResponse?.disaggregation.genderDisaggregation]);

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
                            format: item.format,
                            id: item.id,
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

    const scoreCardData: ScoreCardProps[] = useMemo(() => ([
        {
            title: 'Readiness',
            value: countryResponse?.countryProfile.readiness ?? undefined,
            date: countryResponse?.countryProfile.readinessDate ?? undefined,
            source: countryResponse?.countryProfile.readinessSource ?? undefined,
        },
        {
            title: 'Vulnerability',
            value: countryResponse?.countryProfile.vulnerability ?? undefined,
            date: countryResponse?.countryProfile.vulnerabilityDate ?? undefined,
            source: countryResponse?.countryProfile.vulnerabilitySource ?? undefined,
        },
        {
            title: 'Risk',
            value: countryResponse?.countryProfile.risk ?? undefined,
            date: countryResponse?.countryProfile.riskDate ?? undefined,
            source: countryResponse?.countryProfile.riskSource ?? undefined,
        },
        {
            title: 'Response',
            value: countryResponse?.countryProfile.response ?? undefined,
            date: countryResponse?.countryProfile.responseDate ?? undefined,
            source: countryResponse?.countryProfile.responseSource ?? undefined,
        },
    ]), [
        countryResponse?.countryProfile,
    ]);

    const statusRendererParams = useCallback((_, data: CountryWiseOutbreakCases) => ({
        heading: data.emergency,
        // TODO: fetch format from server
        statValue: formatNumber('raw', data.totalCases ?? 0),
        subHeading: 'Number of cases',
        newDeaths: data.newDeaths,
        newCasesPerMillion: data.newCasesPerMillion,
        totalDeaths: data.totalDeaths,
        newCases: data.newCases,
        newDeathsPerMillion: data.newDeathsPerMillion,
    }), []);

    const readinessRendererParams = useCallback((_, data: ScoreCardProps) => ({
        title: data.title,
        value: data.value,
        date: data.date,
        source: data.source,
        indicator: metricTypeForColor(data),
    }), []);

    const currentOutbreak = useMemo(() => {
        if (filterValues?.outbreak) {
            return filterValues.outbreak;
        }
        return outbreaks.map((o) => o.emergency).join(', ');
    }, [filterValues?.outbreak, outbreaks]);

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
                                {normalCommaFormatter().format(item.value ?? 0)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={_cs(className, styles.countryWrapper)}>
            {countryResponseLoading && <PendingMessage />}
            <div className={styles.countryMain}>
                <div className={styles.countryDetailWrapper}>
                    <ContainerCard
                        className={styles.statusCardContainer}
                        contentClassName={_cs(
                            styles.statusContainer,
                            (
                                totalNumberOfCases
                                && totalNumberOfCases.length > 1
                            ) && styles.wrapReversed,
                        )}
                    >
                        {(totalNumberOfCases
                            && totalNumberOfCases.length > 0)
                            && (
                                <ListView
                                    className={styles.infoCards}
                                    renderer={PercentageStats}
                                    rendererParams={statusRendererParams}
                                    data={totalNumberOfCases}
                                    keySelector={percentageKeySelector}
                                    errored={false}
                                    filtered={false}
                                    pending={false}
                                />
                            )}
                        <div className={styles.scoreCard}>
                            <span className={styles.scoreHeading}>
                                Global Health Security Index
                            </span>
                            <ListView
                                className={styles.readinessListCard}
                                renderer={ScoreCard}
                                rendererParams={readinessRendererParams}
                                data={scoreCardData}
                                keySelector={readinessKeySelector}
                                errored={false}
                                filtered={false}
                                pending={false}
                            />
                            <span className={styles.scoreFooter}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Nam posuere lorem nec elementum dapibus.
                                Maecenas eu massa at sapien semper pharetra.
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Nam posuere lorem nec elementum dapibus.
                                Maecenas eu massa at sapien semper pharetra.
                            </span>
                        </div>
                    </ContainerCard>
                    {filterValues?.indicator ? (
                        <div className={styles.indicatorWrapper}>
                            {((statusUncertainty?.indicatorValue ?? 0) > 0) && (
                                <PercentageStats
                                    className={styles.percentageCard}
                                    heading="Global"
                                    headerDescription={statusUncertainty?.indicatorDescription}
                                    headingSize="extraSmall"
                                    // TODO: fetch format from server
                                    statValue={formatNumber(
                                        'percent',
                                        statusUncertainty?.indicatorValue ?? 0,
                                    )}
                                    icon={null}
                                />
                            )}
                            {((uncertaintyChart?.length ?? 0) > 0) && (
                                <UncertaintyChart
                                    className={styles.indicatorsChart}
                                    uncertainData={(uncertaintyChart && uncertaintyChart) ?? []}
                                    emergencyFilterValue={filterValues.outbreak}
                                    heading="Indicator overview over the last 12 months"
                                    headingDescription={`Trend chart for ${selectedIndicatorName ?? filterValues?.indicator}`}
                                />
                            )}
                            {(genderDisaggregation?.length ?? 0) > 0 && (
                                <ContainerCard
                                    className={styles.genderDisaggregation}
                                    contentClassName={styles.genderDisaggregationContent}
                                    heading="Gender Disaggregation"
                                    headerDescription={selectedIndicatorName}
                                    headingClassName={styles.heading}
                                    headingSize="extraSmall"
                                >
                                    <div className={styles.genderDisaggregation}>
                                        <ResponsiveContainer
                                            className={styles.responsiveContainer}
                                        >
                                            <BarChart
                                                data={genderDisaggregation}
                                                barSize={18}
                                            >
                                                <Bar
                                                    dataKey="indicatorValue"
                                                    radius={[10, 10, 0, 0]}
                                                    fill="#8DD2B1"
                                                >
                                                    <LabelList
                                                        dataKey="indicatorValue"
                                                        position="insideBottomLeft"
                                                        fill="#8DD2B1"
                                                        fontSize={16}
                                                        angle={270}
                                                        dx={-15}
                                                        dy={-3}
                                                        formatter={customLabel}
                                                    />
                                                </Bar>
                                                <XAxis
                                                    dataKey="category"
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    type="number"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    domain={[0, 100]}
                                                />
                                                <Tooltip
                                                    allowEscapeViewBox={{
                                                        x: true,
                                                        y: false,
                                                    }}
                                                    cursor={false}
                                                    content={<CustomDisaggregationTooltip />}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ContainerCard>
                            )}
                            {(ageDisaggregation?.length ?? 0) > 0 && (
                                <ContainerCard
                                    className={styles.ageDisaggregation}
                                    contentClassName={styles.ageDisaggregationContent}
                                    heading="Age Disaggregation"
                                    headerDescription={selectedIndicatorName}
                                    headingClassName={styles.heading}
                                    headingSize="extraSmall"
                                >
                                    <div className={styles.ageDisaggregation}>
                                        <ResponsiveContainer
                                            className={styles.responsiveContainer}
                                        >
                                            <BarChart
                                                data={ageDisaggregation}
                                                barSize={18}
                                            >
                                                <Bar
                                                    dataKey="indicatorValue"
                                                    radius={[10, 10, 0, 0]}
                                                    fill="#8DD2B1"
                                                >
                                                    <LabelList
                                                        dataKey="indicatorValue"
                                                        position="insideBottomLeft"
                                                        fill="#8DD2B1"
                                                        fontSize={16}
                                                        angle={270}
                                                        dx={-15}
                                                        dy={-3}
                                                        formatter={customLabel}
                                                    />
                                                </Bar>
                                                <XAxis
                                                    dataKey="category"
                                                    tickLine={false}
                                                    fontSize={12}
                                                />
                                                <YAxis
                                                    type="number"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    domain={[0, 100]}
                                                />
                                                <Tooltip
                                                    allowEscapeViewBox={{
                                                        x: true,
                                                        y: false,
                                                    }}
                                                    cursor={false}
                                                    content={<CustomDisaggregationTooltip />}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ContainerCard>
                            )}
                        </div>
                    ) : (
                        <ContainerCard
                            className={styles.countryTrend}
                            heading="Outbreaks overview over the last 12 months"
                            headingDescription={`Number of cases for ${currentOutbreak}`}
                            headingSize="extraSmall"
                            headingClassName={styles.heading}
                            contentClassName={styles.responsiveContent}
                        >
                            <ChartContainer
                                className={styles.responsiveContainer}
                                data={emergencyLineChart}
                            >
                                <LineChart
                                    data={emergencyLineChart}
                                >
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        tickFormatter={dateTickFormatter}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        padding={{ top: 30 }}
                                        tickFormatter={normalizedTickFormatter}
                                    />
                                    <Tooltip
                                        content={customOutbreakTooltip}
                                    />
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
                            </ChartContainer>
                        </ContainerCard>
                    )}
                </div>
                <ContainerCard
                    className={styles.countryInfo}
                    headingSectionClassName={styles.countryHeader}
                    headerIconsContainerClassName={styles.countryAvatar}
                    headingClassName={styles.countryHeading}
                    headerIcons={countryResponse?.countryProfile?.iso3 && (
                        <img
                            src={`https://rcce-dashboard.s3.eu-west-3.amazonaws.com/flags/${countryResponse?.countryProfile?.iso3}.png`}
                            alt={isDefined(countryResponse?.countryProfile.countryName)
                                ? countryResponse?.countryProfile.countryName
                                : undefined}
                        />
                    )}
                    headingSize="small"
                    heading={countryResponse?.countryProfile.countryName}
                    contentClassName={styles.countryDetails}
                >
                    {isDefined(countryResponse?.countryProfile.populationSize) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Population"
                            value={(
                                <NumberOutput
                                    value={countryResponse?.countryProfile.populationSize}
                                />
                            )}
                        />
                    )}
                    {isDefined(internetAccess) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Internet access"
                            value={(
                                <>
                                    {internetAccess}
                                    {isDefined(internetAccessRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={internetAccessRegion}
                                        />
                                    )}
                                </>
                            )}
                        />
                    )}
                    {isDefined(literacyRate) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Literacy rate"
                            value={(
                                <>
                                    {literacyRate}
                                    {isDefined(literacyRateRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={literacyRateRegion}
                                        />
                                    )}
                                </>
                            )}
                        />
                    )}
                    {isDefined(washAccessNational) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Access to basic washing facilities"
                            value={(
                                <>
                                    {washAccessNational}
                                    {isDefined(washAccessNationalRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={washAccessNationalRegion}
                                        />
                                    )}
                                </>
                            )}
                        />
                    )}
                    {isDefined(countryResponse?.countryProfile.medicalStaff) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Doctors and nurses per 1000 people"
                            value={(
                                <>
                                    {medicalStaff}
                                    {isDefined(countryResponse?.countryProfile.medicalStaffRegion)
                                        && (
                                            <TextOutput
                                                labelContainerClassName={styles.regionalText}
                                                valueContainerClassName={styles.regionalText}
                                                label={countryResponse?.countryProfile.region}
                                                value={medicalStaffRegional}
                                            />
                                        )}
                                </>
                            )}
                        />
                    )}
                    {isDefined(stringency) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Stringency"
                            value={(
                                <>
                                    {stringency}
                                    {isDefined(stringencyRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={stringencyRegion}
                                        />
                                    )}
                                </>
                            )}
                        />
                    )}
                    {isDefined(regional) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Regional cases %"
                            value={regional}
                        />
                    )}
                    {isDefined(economicSupportIndex) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Economic support index"
                            value={(
                                <>
                                    {economicSupportIndex}
                                    {isDefined(economicSupportIndexRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={economicSupportIndexRegion}
                                        />
                                    )}
                                </>
                            )}
                        />
                    )}
                </ContainerCard>
            </div>
            <Sources
                country={filterValues?.country}
                emergency={filterValues?.outbreak}
                subvariable={filterValues?.subvariable}
                indicatorId={filterValues?.indicator}
            />
        </div>
    );
}

export default Country;
