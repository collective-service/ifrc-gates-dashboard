import React, { useCallback, useMemo } from 'react';
import {
    isNotDefined,
    listToGroupList,
    _cs,
    mapToList,
    unique,
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

import IndicatorChart from '#components/IndicatorChart';
import PercentageStats from '#components/PercentageStats';
import ScoreCard from '#components/ScoreCard';
import {
    indicatorData,
} from '#utils/dummyData';
import { decimalToPercentage } from '#utils/common';
import {
    ContextualQuery,
    ContextualQueryVariables,
    CountryQuery,
    CountryQueryVariables,
    IndicatorQuery,
    IndicatorQueryVariables,
} from '#generated/types';

import styles from './styles.css';
import { FilterType } from '../Filters';

interface ScoreCardProps {
    title: string;
    value?: number;
    metricType: 'positive' | 'negative';
    indicator?: 'red' | 'yellow' | 'orange' | 'green' | undefined;
}
interface countryWiseOutbreakCases {
    key: string;
    iso3: string;
    emergency: string;
    contextIndicatorValue?: number | null | undefined;
    contextIndicatorId: string;
}

const percentageKeySelector = (d: countryWiseOutbreakCases) => d.key;
const readinessKeySelector = (d: ScoreCardProps) => d.title;

const COLORS = ['#52625A', '#567968', '#69A688', '#7AD6A8', '#AFFAD5', '#D6F9E8'];

const COUNTRY_PROFILE = gql`
    query Country(
        $iso3: String,
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
    }
`;

const INDICATOR = gql`
    query Indicator(
        $iso3: String!,
    ) {
        disaggregation {
            ageDisaggregation(iso3: $iso3) {
                category
                indicatorValue
            }
            genderDisaggregation(iso3: $iso3) {
                category
                indicatorValue
            }
        }
    }
`;

const CONTEXTUAL = gql`
    query Contextual(
        $iso3: String,
        $contextIndicatorId: String!,
    ) {
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

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
}

interface legend {
    age?: string;
    gender?: string;
    fill: string;
}

function Country(props: Props) {
    const {
        filterValues,
    } = props;

    const countryVariables = useMemo(() => ({
        iso3: filterValues?.country ?? 'NPL',
        contextIndicatorsId: 'total_cases',
        emergency: '',
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

    const indicatorVariables = useMemo(() => ({
        iso3: filterValues?.country ?? 'NPL',
    }), [filterValues?.country]);

    const {
        data: indicatorResponse,
    } = useQuery<IndicatorQuery, IndicatorQueryVariables>(
        INDICATOR,
        {
            variables: indicatorVariables,
        },
    );
    const contextVariables = useMemo(() => ({
        iso3: filterValues?.country ?? 'NPL',
        contextIndicatorId: 'total_cases',
        emergency: '',
    }), [
        filterValues?.country,
    ]);

    const {
        data: contextResponse,
    } = useQuery<ContextualQuery, ContextualQueryVariables>(
        CONTEXTUAL,
        {
            variables: contextVariables,
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

    const countryWiseOutbreakCases: countryWiseOutbreakCases[] | undefined = useMemo(() => {
        const casesGroupList = listToGroupList(
            contextResponse?.contextualData || [],
            (emergency) => emergency.emergency,
        );
        return (
            Object.entries(casesGroupList).map(([emergency, emergencyItems]) => (
                {
                    ...emergencyItems[0],
                    key: `${emergency}`,
                }
            ))
        );
    }, [contextResponse?.contextualData]);

    const outbreakLineChartData = useMemo(() => {
        const outbreakGroupList = listToGroupList(
            contextResponse?.contextualData,
            (date) => date.contextDate ?? '',
        );
        return mapToList(outbreakGroupList,
            (group, key) => group.reduce(
                (acc, item) => ({
                    ...acc,
                    [item.emergency]: item.contextIndicatorValue,
                    date: new Date(item.contextDate)
                        .toLocaleString(
                            'default', { month: 'short' },
                        ),
                }), { date: key },
            ));
    }, [contextResponse?.contextualData]);

    const outbreaks = useMemo(() => (
        unique(
            contextResponse?.contextualData ?? [],
            (d) => d.emergency,
        ).map((item) => {
            const colors: Record<string, string> = {
                'COVID-19': '#FFDD98',
                Monkeypox: '#ACA28E',
            };

            return ({
                emergency: item.emergency,
                fill: colors[item.emergency] ?? 'pink',
            });
        })
    ), [contextResponse?.contextualData]);

    const genders = useMemo(() => (
        unique(
            indicatorResponse?.disaggregation.genderDisaggregation ?? [],
            (d) => d.category,
        ).map((item, index) => (
            {
                gender: item.category,
                fill: COLORS[index % COLORS.length] ?? 'green',
            }
        ))
    ), [indicatorResponse?.disaggregation.genderDisaggregation]);

    const age = useMemo(() => (
        unique(
            indicatorResponse?.disaggregation.ageDisaggregation ?? [],
            (d) => d.category,
        ).map((item, index) => (
            {
                age: item.category,
                fill: COLORS[index % COLORS.length] ?? 'green',
            }
        ))
    ), [indicatorResponse?.disaggregation.ageDisaggregation]);

    const ageCustomLegend = (legendData: legend[]) => (
        <ul>
            {
                legendData.map((item) => (
                    <li className={styles.legendList}>
                        <div
                            className={styles.legendBox}
                            style={{ backgroundColor: item.fill }}
                        />
                        <div className={styles.legendDetails}>
                            {item.age
                                && <div className={styles.legendTitle}>{item.age}</div>}
                            {item.gender
                                && <div className={styles.legendTitle}>{item.gender}</div>}
                            <div className={styles.regionalText}>
                                Regional 30%
                            </div>
                        </div>
                    </li>
                ))
            }
        </ul>
    );

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

    const statusRendererParams = useCallback((_, data: countryWiseOutbreakCases) => ({
        heading: data.emergency,
        statValue: data.contextIndicatorValue,
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
                        <IndicatorChart
                            className={styles.indicatorsChart}
                            heading="Indicator overview over the last 12 months"
                            headerDescription="Lorem ipsum"
                            chartData={indicatorData}
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
                                        data={indicatorResponse
                                            ?.disaggregation.genderDisaggregation}
                                        dataKey="indicatorValue"
                                        // labelLine={false}
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
                                        content={ageCustomLegend(genders)}
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
                                        data={indicatorResponse
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
                                        content={ageCustomLegend(age)}
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
                        {countryResponse?.countryProfile.populationSize && (
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
                        {internetAccess && (
                            <TextOutput
                                className={styles.countryTextOutput}
                                valueContainerClassName={styles.valueText}
                                labelContainerClassName={styles.labelText}
                                hideLabelColon
                                label="Internet access"
                                value={(
                                    <>
                                        {`${internetAccess}%`}
                                        <TextOutput
                                            className={styles.regionalText}
                                            labelContainerClassName={styles.regionalText}
                                            label={countryResponse?.countryProfile.region}
                                            value={`${internetAccessRegion}%`}
                                        />
                                    </>
                                )}
                            />
                        )}
                        {literacyRate && (
                            <TextOutput
                                className={styles.countryTextOutput}
                                valueContainerClassName={styles.valueText}
                                labelContainerClassName={styles.labelText}
                                hideLabelColon
                                label="Literacy rate"
                                value={(
                                    <>
                                        {`${literacyRate}%`}
                                        <div className={styles.regionalText}>
                                            {`${countryResponse?.countryProfile.region}: ${literacyRateRegion}%`}
                                        </div>
                                    </>
                                )}
                            />
                        )}
                        {washAccessNational && (
                            <TextOutput
                                className={styles.countryTextOutput}
                                valueContainerClassName={styles.valueText}
                                labelContainerClassName={styles.labelText}
                                hideLabelColon
                                label="Access to basic washing facilities"
                                value={(
                                    <>
                                        {`${washAccessNational}%`}
                                        <div className={styles.regionalText}>
                                            {`${countryResponse?.countryProfile.region}: ${washAccessNationalRegion}%`}
                                        </div>
                                    </>
                                )}
                            />
                        )}
                        {countryResponse?.countryProfile.medicalStaff && (
                            <TextOutput
                                className={styles.countryTextOutput}
                                valueContainerClassName={styles.valueText}
                                labelContainerClassName={styles.labelText}
                                hideLabelColon
                                label="Doctors and nurses per 1000 people"
                                value={(
                                    <>
                                        {(countryResponse?.countryProfile.medicalStaff)?.toFixed(0)}
                                        <div className={styles.regionalText}>
                                            {`${countryResponse?.countryProfile.region}: ${(countryResponse.countryProfile.medicalStaffRegion)?.toFixed(0)}`}
                                        </div>
                                    </>
                                )}
                            />
                        )}
                        {stringency && (
                            <TextOutput
                                className={styles.countryTextOutput}
                                valueContainerClassName={styles.valueText}
                                labelContainerClassName={styles.labelText}
                                hideLabelColon
                                label="Stringency"
                                value={(
                                    <>
                                        {`${stringency}%`}
                                        <div className={styles.regionalText}>
                                            {`${countryResponse?.countryProfile.region}: ${stringencyRegion}%`}
                                        </div>
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
                        {economicSupportIndex && (
                            <TextOutput
                                className={styles.countryTextOutput}
                                valueContainerClassName={styles.valueText}
                                labelContainerClassName={styles.labelText}
                                hideLabelColon
                                label="Economic support index"
                                value={(
                                    <>
                                        {`${economicSupportIndex}%`}
                                        <div className={styles.regionalText}>
                                            {`${countryResponse?.countryProfile.region}: ${economicSupportIndexRegion}%`}
                                        </div>
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
