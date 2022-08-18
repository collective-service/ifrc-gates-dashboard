import React, { useCallback } from 'react';
import { isNotDefined, _cs } from '@togglecorp/fujs';
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
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import IndicatorChart from '#components/IndicatorChart';
import PercentageStats from '#components/PercentageStats';
import ReadinessCard from '#components/ReadinessCard';
import {
    indicatorData,
    outbreakData,
    statusData,
    genderDisaggregationData,
    PercentageStatsProps,
} from '#utils/dummyData';
import { CountryQuery } from '#generated/types';

import styles from './styles.css';

interface CountryProps {
    className?: string;
}

interface ReadinessCardProps {
    title: string;
    value?: number;
    metricType: 'positive' | 'negative';
    indicator?: 'red' | 'yellow' | 'orange' | 'green' | undefined;
}

const percentageKeySelector = (d: PercentageStatsProps) => d.id;
const readinessKeySelector = (d: ReadinessCardProps) => d.title;

const COLORS = ['#567968', '#52625A', '#AFFAD5'];

const COUNTRY_PROFILE = gql`
    query Country($iso3: String) {
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
    }
`;

function Country(props: CountryProps) {
    const {
        data: CountryResponse,
    } = useQuery<CountryQuery>(
        COUNTRY_PROFILE,
        { variables: { iso3: 'NPL' } },
    );

    const {
        className,
    } = props;

    const readinessData: ReadinessCardProps[] = [
        {
            title: 'Readiness',
            value: CountryResponse?.countryProfile.readiness ?? undefined,
            metricType: 'positive',
        },
        {
            title: 'Vulnerability',
            value: CountryResponse?.countryProfile.vulnerability ?? undefined,
            metricType: 'negative',
        },
        {
            title: 'Risk',
            value: CountryResponse?.countryProfile.risk ?? undefined,
            metricType: 'negative',
        },
        {
            title: 'Response',
            value: CountryResponse?.countryProfile.response ?? undefined,
            metricType: 'positive',
        },
    ];

    const statusRendererParams = useCallback((_, data: PercentageStatsProps) => ({
        heading: data.heading,
        statValue: data.statValue,
        suffix: data.suffix,
    }), []);

    const metricTypeForColor = useCallback((data: ReadinessCardProps) => {
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

    const readinessRendererParams = useCallback((_, data: ReadinessCardProps) => ({
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
                            data={statusData}
                            keySelector={percentageKeySelector}
                            errored={false}
                            filtered={false}
                            pending={false}
                        />
                        <ListView
                            className={styles.readinessListCard}
                            renderer={ReadinessCard}
                            rendererParams={readinessRendererParams}
                            data={readinessData}
                            keySelector={readinessKeySelector}
                            errored={false}
                            filtered={false}
                            pending={false}
                        />
                    </ContainerCard>
                    <ContainerCard
                        className={styles.countryTrend}
                        heading="Outbreaks overview over the last 12 months"
                        headingSize="extraSmall"
                        contentClassName={styles.responsiveContent}
                    >
                        <ResponsiveContainer className={styles.responsiveContainer}>
                            <LineChart
                                data={outbreakData}
                            >
                                <XAxis
                                    dataKey="month"
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
                                <Line
                                    dataKey="covid"
                                    type="monotone"
                                    stroke="#ACA28E"
                                    name="COVID 19"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    dataKey="monkeyPox"
                                    type="monotone"
                                    stroke="#FFDD98"
                                    name="Monkey Pox"
                                    strokeWidth={3}
                                    dot={false}
                                />
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
                    heading={CountryResponse?.countryProfile.countryName}
                >
                    <div className={styles.countryDetails}>
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Population"
                            value={CountryResponse?.countryProfile.populationSize}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Internet access"
                            value={(
                                <>
                                    {CountryResponse?.countryProfile.internetAccess}
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
                                    {CountryResponse?.countryProfile.literacyRate}
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
                                    {CountryResponse?.countryProfile.washAccessNational}
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
                                    {CountryResponse?.countryProfile.medicalStaff}
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
                                    {CountryResponse?.countryProfile.stringency}
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
                                    {CountryResponse?.countryProfile.economicSupportIndex}
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
