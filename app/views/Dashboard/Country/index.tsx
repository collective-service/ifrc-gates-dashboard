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
    ListView,
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
    normalFormatter,
    positiveToZero,
    colors,
} from '#utils/common';
import {
    CountryQuery,
    CountryQueryVariables,
} from '#generated/types';
import Sources from '#components/Sources';
import ProgressBar from '#components/ProgressBar';

import { FilterType } from '../Filters';
import CountryStatItem from './CountryStatItem';
import { IndicatorType } from '..';

import styles from './styles.css';

interface ScoreCardProps {
    title: string;
    value?: number;
    date?: string;
    source?: string;
    indicator?: 'red' | 'yellow' | 'orange' | 'green';
    tooltipDescription?: string;
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
    indicatorMonth?: string | null;
    format?: FormatType;
}

type GlobalCard = NonNullable<CountryQuery['dataCountryLevelMostRecent']>[number]

const globalCardKeySelector = (d: GlobalCard) => d.id;
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
        $contextualIndicatorId: String,
    ) {
        countryProfile(iso3: $iso3) {
            iso3
            countryName
            populationSize
            populationComment
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
            stringencyDate
            economicSupportIndex
            economicSupportIndexRegion
            economicSupportIndexDate
            economicSupportIndexSource
            medicalStaff
            medicalStaffRegion
            medicalStaffFormat
            medicalStaffSource
            medicalStaffComment
            literacyRate
            literacyRateRegion
            literacyRateFormat
            literacyRateComment
            literacyRateSource
            internetAccess
            internetAccessRegion
            internetAccessFormat
            internetAccessComment
            internetAccessSource
            washAccessNational
            washAccessNationalRegion
            washAccessNationalFormat
            washAccessNationalComment
            washAccessNationalSource
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
                contextIndicatorId: $indicatorId,
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
            contextIndicatorId: $indicatorId,
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
                indicatorId: $contextualIndicatorId,
                iso3: $iso3,
            }
        ) {
            indicatorValue
            indicatorMonth
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
            id
            indicatorDescription
            indicatorMonth
            indicatorValue
            format
            subvariable
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

const readinessDescription = 'The GHS Index benchmarks health security in the context of other factors critical to fighting outbreaks, such as political and security risks, the broader strength of the health system, and country adherence to global norms. The 2021 Global Health Security Index assesses countries across 6 categories, 37 indicators, and 171 questions using publicly available information.';
const responseDescription = 'Overall Rapid response to and mitigation of the spread of an epidemic. Indicators in this category assess emergency preparedness and response planning, exercising response plans, emergency response operation, linking public health and security authorities, risk communication, access to communications infrastructure, and trade and travel restrictions';
const riskDescription = 'Overall risk environment and country vulnerability to biological threats. Indicators in this category assess political and security risks; socio-economic resilience; infrastructure adequacy; environmental risks; and public health vulnerabilities that may affect the ability of a country to prevent, detect, or respond to an epidemic or pandemic and increase the likelihood that disease outbreaks will spill across national borders.';
const vulnerabilityDescription = 'Subset of Risk Environment measuring Public health vulnerabilities through i) Access to quality healthcare, ii) Access to potable water and sanitation, iii) Public healthcare spending levels per capita and iv) Trust in medical and health advice.';

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
    selectedIndicatorType: IndicatorType | undefined;
}

function Country(props: Props) {
    const {
        filterValues,
        className,
        selectedIndicatorName,
        selectedIndicatorType,
    } = props;

    const countryVariables = useMemo((): CountryQueryVariables => ({
        iso3: filterValues?.country ?? 'AFG',
        requiredIso3: filterValues?.country ?? 'AFG',
        emergency: filterValues?.outbreak,
        subvariable: filterValues?.subvariable,
        indicatorId: filterValues?.indicator ?? 'new_cases_per_million',
        contextualIndicatorId: (selectedIndicatorType === 'Contextual Indicators')
            ? filterValues?.indicator
            : 'total_cases',
    }), [
        filterValues?.country,
        filterValues?.outbreak,
        filterValues?.indicator,
        filterValues?.subvariable,
        selectedIndicatorType,
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
                format: total.format as FormatType,
                indicatorMonth: total.indicatorMonth,
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
    }, [
        countryResponse,
        filterValues?.outbreak,
    ]);

    const uncertaintyChart: UncertainData[] | undefined = useMemo(() => {
        if (selectedIndicatorType === 'Contextual Indicators') {
            return undefined;
        }
        const uncertaintyData = countryResponse?.dataCountryLevel.map((country) => {
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
                uncertainRange: [
                    negativeRange ?? 0,
                    positiveRange ?? 0,
                ],
                // FIXME : solve in common ts
                minimumValue: negativeRange ?? 0,
                maximumValue: positiveRange,
                indicatorName: country.indicatorName,
                format: country.format as FormatType,
                interpolated: country.interpolated,
                subvariable: country.subvariable,
            };
        }).sort((a, b) => compareDate(a.date, b.date));
        return uncertaintyData;
    }, [
        countryResponse?.dataCountryLevel,
        selectedIndicatorType,
    ]);

    const globalCardList = useMemo(() => (
        [...(countryResponse?.dataCountryLevelMostRecent ?? [])].sort(
            (a, b) => compareNumber(b.indicatorValue, a.indicatorValue),
        )
    ), [countryResponse?.dataCountryLevelMostRecent]);

    const selectedSubvariableGlobal = useMemo(() => (
        countryResponse?.dataCountryLevelMostRecent?.find((sub) => (
            sub.subvariable === filterValues?.subvariable
        ))
    ), [
        countryResponse?.dataCountryLevelMostRecent,
        filterValues?.subvariable,
    ]);

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
                            // FIXME: Change contextIndicatorValue in server
                            [emergency.emergency]: item.format === 'percent'
                                ? decimalToPercentage(Number(item.contextIndicatorValue))
                                : Number(item.contextIndicatorValue),
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
        ).map((item) => ({
            emergency: item.emergency,
            fill: colors[item.emergency] ?? '#FFDD98',
        }))
    ), [countryResponse?.contextualData]);

    const scoreCardData: ScoreCardProps[] = useMemo(() => ([
        {
            title: 'Overall',
            value: countryResponse?.countryProfile.readiness ?? undefined,
            date: countryResponse?.countryProfile.readinessDate ?? undefined,
            source: countryResponse?.countryProfile.readinessSource ?? undefined,
            tooltipDescription: readinessDescription,
        },
        {
            title: 'Public Health Vulnerabilities',
            value: countryResponse?.countryProfile.vulnerability ?? undefined,
            date: countryResponse?.countryProfile.vulnerabilityDate ?? undefined,
            source: countryResponse?.countryProfile.vulnerabilitySource ?? undefined,
            tooltipDescription: vulnerabilityDescription,
        },
        {
            title: 'Risk Environment',
            value: countryResponse?.countryProfile.risk ?? undefined,
            date: countryResponse?.countryProfile.riskDate ?? undefined,
            source: countryResponse?.countryProfile.riskSource ?? undefined,
            tooltipDescription: riskDescription,
        },
        {
            title: 'Rapid Response',
            value: countryResponse?.countryProfile.response ?? undefined,
            date: countryResponse?.countryProfile.responseDate ?? undefined,
            source: countryResponse?.countryProfile.responseSource ?? undefined,
            tooltipDescription: responseDescription,
        },
    ]), [
        countryResponse?.countryProfile,
    ]);

    const statusRendererParams = useCallback((_, data: CountryWiseOutbreakCases) => ({
        heading: data.emergency,
        statValue: formatNumber(data.format ?? 'raw', data.totalCases ?? 0),
        headerDescription: selectedIndicatorType === 'Contextual Indicators'
            ? selectedIndicatorName
            : 'Number of cases',
        newDeaths: data.newDeaths,
        newCasesPerMillion: data.newCasesPerMillion,
        totalDeaths: data.totalDeaths,
        newCases: data.newCases,
        newDeathsPerMillion: data.newDeathsPerMillion,
        indicatorMonth: data.indicatorMonth,
    }), [
        selectedIndicatorType,
        selectedIndicatorName,
    ]);

    const readinessRendererParams = useCallback((_, data: ScoreCardProps) => ({
        title: data.title,
        value: data.value,
        date: data.date,
        source: data.source,
        indicator: metricTypeForColor(data),
        tooltipDescription: data.tooltipDescription,
    }), []);

    const globalCardRendererParams = useCallback((_, data: GlobalCard) => ({
        barName: filterValues?.subvariable === data.subvariable
            ? (<b>{data.subvariable}</b>) : data.subvariable,
        value: data.indicatorValue,
        format: data.format as FormatType,
        totalValue: 1,
        color: '#98A6B5',
        valueTitle: data.subvariable,
    }), [
        filterValues?.subvariable,
    ]);

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
                                {formatNumber('raw' as FormatType, item.value ?? 0)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const hasOutbreakFilterData = outbreaks.find(((o) => o.emergency === filterValues?.outbreak));
    const showLineChart = isNotDefined(filterValues?.outbreak) ? true : !!hasOutbreakFilterData;

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
                                The GHS Index is a project of the Nuclear Threat
                                Initiative (NTI) and the Johns Hopkins Center for
                                Health Security and was developed with Economist Impact.
                                Link:
                                &nbsp;
                                <a
                                    href="https://www.ghsindex.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    https://www.ghsindex.org/
                                </a>
                            </span>
                        </div>
                    </ContainerCard>
                    {(selectedIndicatorType === 'Social Behavioural Indicators') ? (
                        <div className={styles.indicatorWrapper}>
                            {(globalCardList) && (
                                <ContainerCard
                                    className={styles.percentageCard}
                                    heading="Global"
                                    headingSize="extraSmall"
                                    headerDescription={`${countryResponse
                                        ?.dataCountryLevelMostRecent[0].indicatorDescription} - ${filterValues?.subvariable}`}
                                    contentClassName={styles.globalDetails}
                                >
                                    <div className={styles.globalValue}>
                                        {selectedSubvariableGlobal?.indicatorValue
                                            ? formatNumber(
                                                selectedSubvariableGlobal?.format as FormatType,
                                                selectedSubvariableGlobal?.indicatorValue,
                                            )
                                            : 'N/A'}
                                    </div>
                                    <ListView
                                        className={styles.globalProgressBar}
                                        renderer={ProgressBar}
                                        keySelector={globalCardKeySelector}
                                        rendererParams={globalCardRendererParams}
                                        data={globalCardList}
                                        pending={countryResponseLoading}
                                        errored={false}
                                        filtered={false}
                                    />
                                </ContainerCard>
                            )}
                            {((uncertaintyChart?.length ?? 0) > 0) && (
                                <UncertaintyChart
                                    className={styles.indicatorsChart}
                                    uncertainData={(uncertaintyChart && uncertaintyChart) ?? []}
                                    emergencyFilterValue={filterValues?.outbreak}
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
                            heading={filterValues?.indicator
                                ? 'Indicator overview over the last 12 months'
                                : 'Outbreaks overview over the last 12 months'}
                            headingDescription={`${filterValues?.indicator
                                ? selectedIndicatorName ?? ''
                                : 'New cases per million'} for ${currentOutbreak}`}
                            headingSize="extraSmall"
                            headingClassName={styles.heading}
                            contentClassName={styles.responsiveContent}
                        >
                            <ChartContainer
                                className={styles.responsiveContainer}
                                data={emergencyLineChart}
                                hasFilteredData={showLineChart}
                            >
                                <LineChart
                                    data={emergencyLineChart}
                                >
                                    <XAxis
                                        dataKey="date"
                                        padding={{
                                            right: 30,
                                            left: 20,
                                        }}
                                        tickLine={false}
                                        fontSize={12}
                                        interval={0}
                                        angle={-30}
                                        tickFormatter={dateTickFormatter}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
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
                        <CountryStatItem
                            label="Population"
                            value={formatNumber(
                                'raw',
                                countryResponse?.countryProfile.populationSize,
                            )}
                            source={countryResponse?.countryProfile.populationComment ?? undefined}
                        />
                    )}
                    {isDefined(internetAccess) && (
                        <CountryStatItem
                            label="Internet access"
                            value={internetAccess}
                            showRegionalValue
                            region={countryResponse?.countryProfile.region ?? undefined}
                            regionalValue={internetAccessRegion}
                            source={countryResponse?.countryProfile?.internetAccessSource
                                ?? undefined}
                            date={countryResponse?.countryProfile?.internetAccessComment
                                ?? undefined}
                        />
                    )}
                    {isDefined(literacyRate) && (
                        <CountryStatItem
                            label="Literacy rate"
                            value={literacyRate}
                            showRegionalValue
                            region={countryResponse?.countryProfile.region ?? undefined}
                            regionalValue={literacyRateRegion}
                            source={countryResponse?.countryProfile?.literacyRateSource
                                ?? undefined}
                            date={countryResponse?.countryProfile?.literacyRateComment
                                ?? undefined}
                        />
                    )}
                    {isDefined(washAccessNational) && (
                        <CountryStatItem
                            label="Access to basic washing facilities"
                            value={washAccessNational}
                            showRegionalValue
                            region={countryResponse?.countryProfile.region ?? undefined}
                            regionalValue={washAccessNationalRegion}
                            source={countryResponse?.countryProfile?.washAccessNationalSource
                                ?? undefined}
                            date={countryResponse?.countryProfile?.washAccessNationalComment
                                ?? undefined}
                        />
                    )}
                    {isDefined(countryResponse?.countryProfile.medicalStaff) && (
                        <CountryStatItem
                            label="Doctors and nurses per 1000 people"
                            value={medicalStaff}
                            showRegionalValue
                            region={countryResponse?.countryProfile.region ?? undefined}
                            regionalValue={medicalStaffRegional}
                            source={countryResponse?.countryProfile?.medicalStaffSource
                                ?? undefined}
                            date={countryResponse?.countryProfile?.medicalStaffComment
                                ?? undefined}
                        />
                    )}
                    {isDefined(stringency) && (
                        <CountryStatItem
                            label="Stringency"
                            value={stringency}
                            showRegionalValue
                            region={countryResponse?.countryProfile.region ?? undefined}
                            regionalValue={stringencyRegion}
                            date={countryResponse?.countryProfile?.stringencyDate ?? undefined}
                        />
                    )}
                    {isDefined(regional) && (
                        <CountryStatItem
                            label="Regional cases %"
                            value={regional}
                        />
                    )}
                    {isDefined(economicSupportIndex) && (
                        <CountryStatItem
                            label="Economic support index"
                            value={economicSupportIndex}
                            showRegionalValue
                            region={countryResponse?.countryProfile.region ?? undefined}
                            regionalValue={economicSupportIndexRegion}
                            source={countryResponse?.countryProfile?.economicSupportIndexSource
                                ?? undefined}
                            date={countryResponse?.countryProfile?.economicSupportIndexDate
                                ?? undefined}
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
