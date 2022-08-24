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
    genderDisaggregationData,
} from '#utils/dummyData';
import { decimalToPercentage } from '#utils/common';
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
interface countryWiseOutbreakCases {
    key: string;
    iso3: string;
    emergency: string;
    contextIndicatorValue?: number | null | undefined;
    contextIndicatorId: string;
}

const percentageKeySelector = (d: countryWiseOutbreakCases) => d.key;
const readinessKeySelector = (d: ScoreCardProps) => d.title;

const COLORS = ['#567968', '#52625A', '#AFFAD5'];

const COUNTRY_PROFILE = gql`
    query Country(
        $iso3: String,
        $contextIndicatorsId: String,
        $emergency: String
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
        }
        countryEmergencyProfile(
            filters: {
                iso3: $iso3,
                contextIndicatorId: $contextIndicatorsId,
                emergency: $emergency,
        }) {
            iso3
            emergency
            contextIndicatorValue
            contextIndicatorId
            contextDate
        }
    }
`;

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
}

function Country(props: Props) {
    const {
        filterValues,
    } = props;

    const variables = useMemo(() => ({
        iso3: filterValues?.country ?? 'AFG',
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
            variables,
        },
    );

    const internetAccess = decimalToPercentage(countryResponse?.countryProfile.internetAccess);
    const literacyRate = decimalToPercentage(countryResponse?.countryProfile.literacyRate);
    const washAccessNational = decimalToPercentage(countryResponse
        ?.countryProfile.washAccessNational);
    const stringency = decimalToPercentage(countryResponse?.countryProfile.stringency);
    const economicSupportIndex = decimalToPercentage(countryResponse
        ?.countryProfile.economicSupportIndex);

    const countryWiseOutbreakCases: countryWiseOutbreakCases[] | undefined = countryResponse
        ?.countryEmergencyProfile.map((item) => (
            {
                ...item,
                key: `${item.iso3}${item.contextIndicatorId}${item.emergency}`,
            }
        ));

    const outbreakGroupList = listToGroupList(
        countryResponse?.countryEmergencyProfile,
        (date) => date.contextDate ?? '',
    );

    const outbreakLineChartData = mapToList(
        outbreakGroupList,
        (group, key) => group.reduce(
            (acc, item) => ({
                ...acc,
                [item.emergency]: item.contextIndicatorValue,
            }),
            { date: key },
        ),
    );

    const outbreaks = unique(
        countryResponse?.countryEmergencyProfile ?? [],
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
    });

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
                        {!isScoreCardValueEmpty
                            && (
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
                            heading="Percentage of unvaccinated individuals who have tried to get vaccinated"
                            headerDescription="Lorem ipsum explaining the topic"
                            headingSize="extraSmall"
                        >
                            <ResponsiveContainer className={styles.responsiveContainer}>
                                <PieChart>
                                    <Pie
                                        data={genderDisaggregationData}
                                        dataKey="percentage"
                                        labelLine={false}
                                        cx={100}
                                        cy={100}
                                        outerRadius={70}
                                    >
                                        {genderDisaggregationData.map((entry) => (
                                            <Cell
                                                key={`Cell -${entry.id}`}
                                                fill={COLORS[entry.id % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Legend
                                        name="gender"
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
                                        data={genderDisaggregationData}
                                        dataKey="percentage"
                                        labelLine={false}
                                        cx={100}
                                        cy={100}
                                        outerRadius={70}
                                    >
                                        {genderDisaggregationData.map((entry) => (
                                            <Cell
                                                key={`Cell -${entry.id}`}
                                                fill={COLORS[entry.id % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Legend
                                        name="gender"
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
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Population"
                            value={(
                                countryResponse?.countryProfile.populationSize
                                    ? (
                                        <NumberOutput
                                            value={countryResponse?.countryProfile.populationSize}
                                        />
                                    ) : 'N/A'
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Internet access"
                            value={(
                                <>
                                    {internetAccess ? `${internetAccess}%` : 'N/A'}
                                    <div className={styles.regionalText}>
                                        Regional 30%
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Literacy rate"
                            value={(
                                <>
                                    {literacyRate ? `${literacyRate}%` : 'N/A'}
                                    <div className={styles.regionalText}>
                                        Regional 30%
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Access to basic washing facilities"
                            value={(
                                <>
                                    {washAccessNational ? `${washAccessNational}%` : 'N/A'}
                                    <div className={styles.regionalText}>
                                        Regional 30%
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Doctors and nurses per 1000 people"
                            value={(
                                <>
                                    {countryResponse?.countryProfile.medicalStaff
                                        ? (countryResponse?.countryProfile.medicalStaff)?.toFixed(1)
                                        : 'N/A'}
                                    <div className={styles.regionalText}>
                                        Regional 30%
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Stringency"
                            value={(
                                <>
                                    {stringency ? `${stringency}%` : 'N/A'}
                                    <div className={styles.regionalText}>
                                        Regional 30%
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Regional cases %"
                            value={(
                                <>
                                    34%
                                    <div className={styles.regionalText}>
                                        Regional 30%
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Economic support index"
                            value={(
                                <>
                                    {economicSupportIndex ? `${economicSupportIndex}%` : 'N/A'}
                                    <div className={styles.regionalText}>
                                        Regional 30%
                                    </div>
                                </>
                            )}
                        />
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
