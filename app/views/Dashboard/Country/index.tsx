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
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    ContainerCard,
    TextOutput,
    ListView,
    NumberOutput,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import UncertaintyChart from '#components/UncertaintyChart';
import PercentageStats from '#components/PercentageStats';
import ScoreCard from '#components/ScoreCard';
import CustomLegend from '#components/CustomLegend';
import {
    decimalToPercentage,
    getShortMonth,
} from '#utils/common';
import {
    CountryQuery,
    CountryQueryVariables,
} from '#generated/types';

import styles from './styles.css';
import { FilterType } from '../Filters';

interface ScoreCardProps {
    title: string;
    value?: number;
    metricType: 'positive' | 'negative';
    indicator?: 'red' | 'yellow' | 'orange' | 'green' | undefined;
}
interface EmergencyItems {
    iso3: string;
    emergency: string;
    contextIndicatorValue?: number | null;
    contextIndicatorId: string;
    contextDate: string;
}
interface CountryWiseOutbreakCases extends EmergencyItems {
    key: string;
}

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
}

interface CustomLegendProps {
    key: string;
    age?: string;
    gender?: string;
    fill: string;
}

const percentageKeySelector = (d: CountryWiseOutbreakCases) => d.key;
const readinessKeySelector = (d: ScoreCardProps) => d.title;
const customLegendKeySelector = (d: CustomLegendProps) => d.key;

const COLORS = ['#52625A', '#567968', '#69A688', '#7AD6A8', '#AFFAD5', '#D6F9E8'];

const COUNTRY_PROFILE = gql`
    query Country(
        $iso3: String,
        $disaggregationIso3: String!,
        $contextIndicatorId: String!,
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
            iso3: $iso3,
            contextIndicatorId:$contextIndicatorId,
        ) {
            iso3
            emergency
            contextIndicatorId
            contextIndicatorValue
            contextDate
        }
    }
`;

function Country(props: Props) {
    const {
        filterValues,
    } = props;

    const countryVariables = useMemo((): CountryQueryVariables => ({
        iso3: filterValues?.country ?? 'AFG',
        contextIndicatorId: 'total_cases',
        disaggregationIso3: filterValues?.country ?? 'AFG',
    }), [
        filterValues?.country,
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

        return (
            Object.entries(casesGroupList).map(([emergency, emergencyItems]) => (
                {
                    ...getLatestDateItems(emergencyItems),
                    key: emergency,
                }
            ))
        );
    }, [countryResponse?.contextualData]);

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

    const genders: CustomLegendProps[] = useMemo(() => (
        // FIXME: Remove unique function after getting key
        unique(
            countryResponse?.disaggregation.genderDisaggregation ?? [],
            (d) => d.category,
        ).map((item, index) => (
            {
                key: `${item.category}-${item.indicatorValue}`,
                gender: item.category,
                fill: COLORS[index % COLORS.length] ?? '#52625A',
            }
        ))
    ), [countryResponse?.disaggregation.genderDisaggregation]);

    const age: CustomLegendProps[] = useMemo(() => (
        // FIXME: Remove unique function after getting key
        unique(
            countryResponse?.disaggregation?.ageDisaggregation ?? [],
            (d) => d.category,
        ).map((item, index) => (
            {
                key: `${item.category}-${item.indicatorValue}`,
                age: item.category,
                fill: COLORS[index % COLORS.length] ?? '#52625A',
            }
        ))
    ), [countryResponse?.disaggregation?.ageDisaggregation]);

    const {
        className,
    } = props;

    const scoreCardData: ScoreCardProps[] = [
        {
            title: 'Readiness',
            value: countryResponse?.countryProfile.readiness ?? undefined,
            metricType: 'positive',
        },
        {
            title: 'Vulnerability',
            value: countryResponse?.countryProfile.vulnerability ?? undefined,
            metricType: 'negative',
        },
        {
            title: 'Risk',
            value: countryResponse?.countryProfile.risk ?? undefined,
            metricType: 'negative',
        },
        {
            title: 'Response',
            value: countryResponse?.countryProfile.response ?? undefined,
            metricType: 'positive',
        },
    ];

    const isScoreCardValueEmpty = scoreCardData.every((score) => isNotDefined(score.value));

    const metricTypeForColor = useCallback((data: ScoreCardProps) => {
        if (isNotDefined(data) || isNotDefined(data.metricType) || isNotDefined(data.value)) {
            return undefined;
        }

        if (
            (data.metricType === 'positive' && data.value > 75)
            || (data.metricType === 'negative' && data.value <= 25)
        ) {
            return 'green' as const;
        }
        if (
            (data.metricType === 'positive' && data.value <= 75 && data.value > 50)
            || (data.metricType === 'negative' && data.value > 25 && data.value <= 50)
        ) {
            return 'yellow' as const;
        }
        if (
            (data.metricType === 'positive' && data.value <= 50 && data.value > 25)
            || (data.metricType === 'negative' && data.value > 50 && data.value <= 75)
        ) {
            return 'orange' as const;
        }
        return 'red' as const;
    }, []);

    const statusRendererParams = useCallback((_, data: CountryWiseOutbreakCases) => ({
        heading: data.emergency,
        statValue: data.contextIndicatorValue,
    }), []);

    const readinessRendererParams = useCallback((_, data: ScoreCardProps) => ({
        title: data.title,
        value: data.value,
        indicator: metricTypeForColor(data),
    }), [metricTypeForColor]);

    const customLegendParams = useCallback((_, data: CustomLegendProps) => ({
        age: data.age,
        gender: data.gender,
        fill: data.fill,
    }), []);

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
                    <ContainerCard
                        className={styles.countryTrend}
                        heading="Outbreaks overview over the last 12 months"
                        headingSize="extraSmall"
                        contentClassName={styles.responsiveContent}
                    >
                        <ResponsiveContainer className={styles.responsiveContainer}>
                            <LineChart
                                data={outbreakLineChartData}
                            >
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    reversed
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    padding={{ top: 30 }}
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
                    <div className={styles.indicatorWrapper}>
                        <PercentageStats
                            className={styles.percentageCard}
                            heading="Percentage of unvaccinated individuals who have tried to get vaccinated"
                            headingSize="extraSmall"
                            statValue={56}
                            suffix="%"
                            icon={null}
                        />
                        <UncertaintyChart
                            className={styles.indicatorsChart}
                        />
                        <ContainerCard
                            className={styles.genderDisaggregation}
                            contentClassName={styles.responsiveContent}
                            heading="Gender disaggregation"
                            headerDescription="Lorem ipsum explaining the topic"
                            headingSize="extraSmall"
                        >
                            <ResponsiveContainer className={styles.responsiveContainer}>
                                <PieChart>
                                    <Pie
                                        data={countryResponse
                                            ?.disaggregation.genderDisaggregation}
                                        dataKey="indicatorValue"
                                        cx={100}
                                        cy={100}
                                        outerRadius={70}
                                    >
                                        {genders.map((entry) => (
                                            <Cell
                                                key={entry.gender}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Pie>
                                    <Legend
                                        width={200}
                                        content={(
                                            <ListView
                                                renderer={CustomLegend}
                                                rendererParams={customLegendParams}
                                                keySelector={customLegendKeySelector}
                                                data={genders}
                                                errored={false}
                                                filtered={false}
                                                pending={false}
                                            />
                                        )}
                                        verticalAlign="middle"
                                        align="right"
                                        layout="vertical"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ContainerCard>
                        <ContainerCard
                            className={styles.ageDisaggregation}
                            contentClassName={styles.responsiveContent}
                            heading="Age disaggregation"
                            headerDescription="Lorem ipsum explaining the topic"
                            headingSize="extraSmall"
                        >
                            <ResponsiveContainer className={styles.responsiveContainer}>
                                <PieChart>
                                    <Pie
                                        data={countryResponse
                                            ?.disaggregation.ageDisaggregation}
                                        dataKey="indicatorValue"
                                        labelLine={false}
                                        cx={100}
                                        cy={100}
                                        outerRadius={70}
                                    >
                                        {age.map((entry) => (
                                            <Cell
                                                key={entry.age}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Pie>
                                    <Legend
                                        width={300}
                                        content={(
                                            <ListView
                                                renderer={CustomLegend}
                                                rendererParams={customLegendParams}
                                                keySelector={customLegendKeySelector}
                                                data={age}
                                                errored={false}
                                                filtered={false}
                                                pending={false}
                                            />
                                        )}
                                        verticalAlign="middle"
                                        align="right"
                                        layout="vertical"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ContainerCard>
                    </div>
                </div>
                <ContainerCard
                    className={styles.countryInfo}
                    headingSectionClassName={styles.countryHeader}
                    headerIconsContainerClassName={styles.countryAvatar}
                    headingClassName={styles.countryHeading}
                    headerIcons={(
                        // FIX ME: COUNTRY AVATAR
                        <img src="https://picsum.photos/50" alt="country-avatar" />
                    )}
                    headingSize="small"
                    heading={countryResponse?.countryProfile.countryName}
                >
                    <div className={styles.countryDetails}>
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
                                        {isDefined(countryResponse
                                            ?.countryProfile.medicalStaffRegion) && (
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
                    </div>
                </ContainerCard>
            </div>
            <ContainerCard
                className={styles.perceptionWrapper}
                contentClassName={styles.perceptionCard}
                footerContent="Data collection not completed - as of March 31st"
            >
                <p>COVID-19 Vaccine Perceptions in Africa</p>
            </ContainerCard>
        </div>
    );
}

export default Country;
