import React, { useCallback, useMemo } from 'react';
import {
    isNotDefined,
    listToGroupList,
    _cs,
    mapToList,
    unique,
    compareDate,
    isDefined,
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
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import { IoInformationCircle } from 'react-icons/io5';
import { BiLinkExternal } from 'react-icons/bi';

import UncertaintyChart, { UncertainData } from '#components/UncertaintyChart';
import PercentageStats from '#components/PercentageStats';
import ScoreCard from '#components/ScoreCard';
import {
    decimalToPercentage,
    getShortMonth,
    normalFormatter,
} from '#utils/common';
import {
    CountryQuery,
    CountryQueryVariables,
} from '#generated/types';

import { FilterType } from '../Filters';

import styles from './styles.css';

interface ScoreCardProps {
    title: string;
    value?: number;
    indicator?: 'red' | 'yellow' | 'orange' | 'green';
}
interface EmergencyItems {
    iso3: string;
    emergency: string;
    contextIndicatorValue?: number | null;
    contextIndicatorId: string;
    contextDate: string;
    newDeaths?: number | null;
    newCasesPerMillion?: number | null;
}
interface CountryWiseOutbreakCases extends EmergencyItems {
    key: string;
}

const dateTickFormatter = (d: string) => getShortMonth(d);
const normalizedTickFormatter = (d: number) => normalFormatter().format(d);
const percentageKeySelector = (d: CountryWiseOutbreakCases) => d.key;
const readinessKeySelector = (d: ScoreCardProps) => d.title;
const customLabel = (val: number | string | undefined) => (
    `${val}%`
);

const COUNTRY_PROFILE = gql`
    query Country(
        $iso3: String,
        $disaggregationIso3: String!,
        $contextIndicatorId: String!,
        $emergency: String,
        $gte: Date!,
        $uncertaintyIso3: String!,
        $subvariable: String!,
        $indicatorId: String,
        $category: String!,
        $uncertaintyEmergency: String!,
        $isTwelveMonth: Boolean,
        $contextDate: Ordering,
        $limit: Int!,
        $offset: Int!,
    ) {
        countryProfile(iso3: $iso3) {
            iso3
            countryName
            populationSize
            internetAccess
            literacyRate
            washAccessNational
            medicalStaff
            stringency
            economicSupportIndex
            readiness
            vulnerability
            risk
            response
            newCasesRegionShare
            region
            stringencyRegion
            washAccessNationalRegion
            literacyRateRegion
            internetAccessRegion
            economicSupportIndexRegion
            medicalStaffRegion
            newCasesPerMillion
            newDeaths
        }
        disaggregation {
            ageDisaggregation(iso3: $disaggregationIso3) {
                category
                indicatorValue
            }
            genderDisaggregation(iso3: $disaggregationIso3) {
                category
                indicatorValue
            }
        }
        contextualData(
            filters: {
                iso3: $iso3,
                contextIndicatorId:$contextIndicatorId,
                emergency: $emergency,
                isTwelveMonth: $isTwelveMonth,
            }
            order: {
                contextDate: $contextDate,
            }
            pagination: {
                limit: $limit,
                offset: $offset,
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
                indicatorMonth: {
                    gte: $gte
                },
                iso3: $uncertaintyIso3,
                subvariable: $subvariable,
                indicatorId: $indicatorId,
                category: $category,
                emergency: $uncertaintyEmergency,
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
        newDeaths: countryEmergencyProfile(
            filters: {
                contextIndicatorId: "new_deaths",
                iso3: $iso3,
            }
            pagination: {
                limit: 5
                offset: 0
            }
            order: {
                contextDate: DESC
            }
        ) {
            id
            contextIndicatorValue
            contextDate
            emergency
            format
        }
        newCasesPerMillion: countryEmergencyProfile(
            filters: {
                contextIndicatorId: "new_cases_per_million",
                iso3: $iso3,
            }
            pagination: {
                limit: 5
                offset: 0
            }
            order: {
                contextDate: DESC
            }
        ) {
            id
            contextIndicatorValue
            contextDate
            emergency
            format
        }
    }
`;
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
        // FIXME: filter needed to be handle from backend
        gte: '2021-08-01',
        contextIndicatorId: 'total_cases',
        disaggregationIso3: filterValues?.country ?? 'AFG',
        emergency: filterValues?.outbreak,
        uncertaintyIso3: filterValues?.country ?? 'AFG',
        subvariable: filterValues?.subvariable ?? '',
        indicatorId: filterValues?.indicator,
        isTwelveMonth: true,
        contextDate: 'DESC',
        // NOTE: Only Global response needed
        category: 'Global',
        uncertaintyEmergency: filterValues?.outbreak ?? '',
        limit: 12,
        offset: 0,
    }), [
        filterValues?.country,
        filterValues?.outbreak,
        filterValues?.indicator,
        filterValues?.subvariable,
    ]);

    const {
        data: countryResponse,
    } = useQuery<CountryQuery, CountryQueryVariables>(
        COUNTRY_PROFILE,
        {
            variables: countryVariables,
        },
    );

    const internetAccess = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.internetAccess)
    ), [countryResponse?.countryProfile.internetAccess]);

    const literacyRate = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.literacyRate)
    ), [countryResponse?.countryProfile.literacyRate]);

    const washAccessNational = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.washAccessNational)
    ), [countryResponse?.countryProfile.washAccessNational]);

    const stringency = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.stringency)
    ), [countryResponse?.countryProfile.stringency]);

    const economicSupportIndex = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.economicSupportIndex)
    ), [countryResponse?.countryProfile.economicSupportIndex]);

    const economicSupportIndexRegion = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.economicSupportIndexRegion)
    ), [countryResponse?.countryProfile.economicSupportIndexRegion]);

    const stringencyRegion = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.stringencyRegion)
    ), [countryResponse?.countryProfile.stringencyRegion]);

    const washAccessNationalRegion = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.washAccessNationalRegion)
    ), [countryResponse?.countryProfile.washAccessNationalRegion]);

    const literacyRateRegion = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.literacyRateRegion)
    ), [countryResponse?.countryProfile.literacyRateRegion]);

    const internetAccessRegion = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.internetAccessRegion)
    ), [countryResponse?.countryProfile.internetAccessRegion]);

    const regional = useMemo(() => (
        decimalToPercentage(countryResponse?.countryProfile.newCasesRegionShare)
    ), [countryResponse?.countryProfile.newCasesRegionShare]);

    const countryWiseOutbreakCases: CountryWiseOutbreakCases[] | undefined = useMemo(() => {
        const casesGroupList = listToGroupList(
            countryResponse?.contextualData ?? [],
            (emergency) => emergency.emergency,
        );

        const getLatestDateItems = (items: EmergencyItems[]) => {
            [...items].sort((a, b) => compareDate(a.contextDate, b.contextDate, -1));

            return items[0];
        };

        const casesGroupArray = mapToList(
            casesGroupList,
            (items, key) => ({
                key,
                items,
            }),
        );

        const cases = casesGroupArray?.map((item) => {
            const newDeaths = countryResponse?.newDeaths.find(
                (deaths) => deaths.emergency === item.key,
            );
            const newCasesPerMillion = countryResponse?.newCasesPerMillion.find(
                (million) => million.emergency === item.key,
            );

            const valueToReturn = {
                ...getLatestDateItems(item.items),
                key: item.key,
                newDeaths: newDeaths?.contextIndicatorValue,
                newCasesPerMillion: newCasesPerMillion?.contextIndicatorValue,
            };

            return valueToReturn;
        });
        return cases;
    }, [
        countryResponse?.contextualData,
        countryResponse?.newCasesPerMillion,
        countryResponse?.newDeaths,
    ]);

    const uncertaintyChart: UncertainData[] | undefined = useMemo(() => (
        countryResponse?.dataCountryLevel.map((country) => {
            const negativeRange = decimalToPercentage(
                (country?.indicatorValue && country?.errorMargin)
                && country?.indicatorValue - country?.errorMargin,
            );
            const positiveRange = decimalToPercentage(
                (country?.indicatorValue && country?.errorMargin)
                && country?.indicatorValue + country?.errorMargin,
            );

            if (isNotDefined(country.errorMargin)) {
                return {
                    emergency: country.emergency,
                    indicatorValue: decimalToPercentage(country.indicatorValue),
                    date: country.indicatorMonth,
                    minimumValue: negativeRange,
                    maximumValue: positiveRange,
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
                date: country.indicatorMonth,
                uncertainRange: [
                    negativeRange ?? 0,
                    positiveRange ?? 0,
                ],
                minimumValue: negativeRange,
                maximumValue: positiveRange,
            };
        })
    ), [countryResponse?.dataCountryLevel]);

    const StatusUncertainty = useMemo(() => {
        const dataCountryLevel = countryResponse?.dataCountryLevel;
        if (!dataCountryLevel) {
            return undefined;
        }
        const getLatestUncertain = [...dataCountryLevel].sort(
            (a, b) => compareDate(a.indicatorMonth, b.indicatorMonth),
        );
        return getLatestUncertain[0];
    }, [countryResponse?.dataCountryLevel]);

    const ageDisaggregation = useMemo(() => countryResponse
        ?.disaggregation.ageDisaggregation.map((age) => (
            {
                category: age.category,
                indicatorValue: decimalToPercentage(age.indicatorValue),
                normalizedValue: normalFormatter().format(age.indicatorValue ?? 0),
            }
        )), [countryResponse?.disaggregation.ageDisaggregation]);

    const genderDisaggregation = useMemo(() => countryResponse
        ?.disaggregation.genderDisaggregation.map((gender) => (
            {
                category: gender.category,
                indicatorValue: decimalToPercentage(gender.indicatorValue),
                normalizedValue: normalFormatter().format(gender.indicatorValue ?? 0),
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

    const scoreCardData: ScoreCardProps[] = [
        {
            title: 'Readiness',
            value: countryResponse?.countryProfile.readiness ?? undefined,
        },
        {
            title: 'Vulnerability',
            value: countryResponse?.countryProfile.vulnerability ?? undefined,
        },
        {
            title: 'Risk',
            value: countryResponse?.countryProfile.risk ?? undefined,
        },
        {
            title: 'Response',
            value: countryResponse?.countryProfile.response ?? undefined,
        },
    ];

    const isScoreCardValueEmpty = scoreCardData.every((score) => isNotDefined(score.value));

    const metricTypeForColor = useCallback((data: ScoreCardProps) => {
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
    }, []);

    const statusRendererParams = useCallback((_, data: CountryWiseOutbreakCases) => ({
        heading: data.emergency,
        statValue: data.contextIndicatorValue,
        newDeaths: data.newDeaths,
        newCasesPerMillion: data.newCasesPerMillion,
    }), []);

    const readinessRendererParams = useCallback((_, data: ScoreCardProps) => ({
        title: data.title,
        value: data.value,
        indicator: metricTypeForColor(data),
    }), [metricTypeForColor]);

    return (
        <div className={_cs(className, styles.countryWrapper)}>
            <div className={styles.countryMain}>
                <div className={styles.countryDetailWrapper}>
                    <ContainerCard
                        className={styles.statusCardContainer}
                        contentClassName={styles.statusContainer}
                    >
                        <ListView
                            className={styles.infoCards}
                            renderer={PercentageStats}
                            rendererParams={statusRendererParams}
                            data={countryWiseOutbreakCases}
                            keySelector={percentageKeySelector}
                            errored={false}
                            filtered={false}
                            pending={false}
                        />
                        {!isScoreCardValueEmpty && (
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
                        )}
                    </ContainerCard>
                    {!filterValues?.indicator && (
                        <ContainerCard
                            className={styles.countryTrend}
                            heading="Outbreaks overview over the last 12 months"
                            headingDescription={`Number of cases for ${outbreaks.map((o) => o.emergency).join(', ')}`}
                            headingSize="extraSmall"
                            contentClassName={styles.responsiveContent}
                        >
                            <ResponsiveContainer className={styles.responsiveContainer}>
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
                        </ContainerCard>
                    )}
                    {filterValues?.indicator && (
                        <div className={styles.indicatorWrapper}>
                            <PercentageStats
                                className={styles.percentageCard}
                                indicatorDescription={StatusUncertainty?.indicatorDescription}
                                headingSize="extraSmall"
                                statValue={decimalToPercentage(
                                    StatusUncertainty?.indicatorValue,
                                )}
                                suffix="%"
                                icon={null}
                            />
                            <UncertaintyChart
                                className={styles.indicatorsChart}
                                uncertainData={(uncertaintyChart && uncertaintyChart) ?? []}
                                emergencyFilterValue={filterValues.outbreak}
                                heading="Indicator overview over the last 12 months"
                                headingDescription={`Trend chart for ${selectedIndicatorName ?? filterValues?.indicator}`}
                            />
                            {(genderDisaggregation && genderDisaggregation.length > 0
                                && ageDisaggregation && ageDisaggregation.length > 0
                            ) && (
                                <>
                                    <ContainerCard
                                        className={styles.disaggregation}
                                        contentClassName={styles.disaggregationContent}
                                        heading="Gender Disaggregation"
                                        headerDescription="Lorem ipsum explaining the topic"
                                        headingSize="extraSmall"
                                    >
                                        {(genderDisaggregation?.length ?? 0) > 0 && (
                                            <div className={styles.genderDisaggregation}>
                                                <div>Gender Disaggregation</div>
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
                                                                y: true,
                                                            }}
                                                            cursor={false}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </ContainerCard>
                                    <ContainerCard
                                        className={styles.disaggregation}
                                        contentClassName={styles.disaggregationContent}
                                        heading="Age Disaggregation"
                                        headerDescription="Lorem ipsum explaining the topic"
                                        headingSize="extraSmall"
                                    >
                                        {(ageDisaggregation?.length ?? 0) > 0 && (
                                            <div className={styles.ageDisaggregation}>
                                                <div>Age Disaggregation</div>
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
                                                                y: true,
                                                            }}
                                                            cursor={false}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                        )}
                                    </ContainerCard>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <ContainerCard
                    className={styles.countryInfo}
                    headingSectionClassName={styles.countryHeader}
                    headerIconsContainerClassName={styles.countryAvatar}
                    headingClassName={styles.countryHeading}
                    headerIcons={(
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
                                    {`${internetAccess}%`}
                                    {isDefined(internetAccessRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={`${internetAccessRegion}%`}
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
                                    {`${literacyRate}%`}
                                    {isDefined(literacyRateRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={`${literacyRateRegion}%`}
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
                                    {`${washAccessNational}%`}
                                    {isDefined(washAccessNationalRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={`${washAccessNationalRegion}%`}
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
                                    {(countryResponse?.countryProfile.medicalStaff)?.toFixed(2)}
                                    {isDefined(
                                        countryResponse?.countryProfile.medicalStaffRegion,
                                    ) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={(countryResponse
                                                ?.countryProfile.medicalStaffRegion)
                                                ?.toFixed(2)}
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
                                    {`${stringency}%`}
                                    {isDefined(stringencyRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={`${stringencyRegion}%`}
                                        />
                                    )}
                                </>
                            )}
                        />
                    )}
                    <TextOutput
                        className={styles.countryTextOutput}
                        valueContainerClassName={styles.valueText}
                        labelContainerClassName={styles.labelText}
                        hideLabelColon
                        label="Regional cases %"
                        value={`${regional}%`}
                    />
                    {isDefined(economicSupportIndex) && (
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Economic support index"
                            value={(
                                <>
                                    {`${economicSupportIndex}%`}
                                    {isDefined(economicSupportIndexRegion) && (
                                        <TextOutput
                                            labelContainerClassName={styles.regionalText}
                                            valueContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={`${economicSupportIndexRegion}%`}
                                        />
                                    )}
                                </>
                            )}
                        />
                    )}
                </ContainerCard>
            </div>
            <div className={styles.perceptionCard}>
                <div className={styles.infoIcon}>
                    <IoInformationCircle />
                </div>
                <div>
                    {`COVID-19 Vaccine Perceptions in ${countryResponse?.countryProfile.countryName}
                    (${countryResponse?.countryProfile.countryName} CDC)`}
                </div>
                <a
                    href="https://www.rcce-collective.net/data/data-tracker/"
                    className={styles.infoIcon}
                >
                    <BiLinkExternal />
                </a>
            </div>
        </div>
    );
}

export default Country;
