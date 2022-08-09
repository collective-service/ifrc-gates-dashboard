import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
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
import StatusCard, { Props as StatusCardProps } from '#components/StatusCard';

import IndicatorChart from '#components/IndicatorChart';
import PercentageStats from '#components/PercentageStats';
import CustomLabel from '#components/CustomLabel';
import {
    indicatorData,
    outbreakData,
    statusData,
    genderDisaggregationData,
} from '#utils/dummyData';

import styles from './styles.css';

const keySelector = (d: StatusCardProps) => d.statusId;

interface CountryProps {
    className?: string;
}

const COLORS = ['#D7DF23', '#616161', '#00ACC1'];

function Country(props: CountryProps) {
    const {
        className,
    } = props;

    const rendererParams = useCallback((_, data: StatusCardProps) => ({
        statusId: data.statusId,
        title: data.title,
        value: data.value,
        regionalValue: data.regionalValue,
    }), []);

    return (
        <div className={_cs(className, styles.countryWrapper)}>
            <div className={styles.countryMain}>
                <div className={styles.countryDetailWrapper}>
                    <ContainerCard
                        className={styles.statusContainer}
                    >
                        <ListView
                            className={styles.infoCards}
                            renderer={StatusCard}
                            rendererParams={rendererParams}
                            data={statusData}
                            keySelector={keySelector}
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
                                    axisLine={false}
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
                                    verticalAlign="top"
                                />
                                <Line
                                    dataKey="covid"
                                    type="monotone"
                                    stroke="#FFF84C"
                                    name="COVID 19"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    dataKey="monkeyPox"
                                    type="monotone"
                                    stroke="#2F339C"
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
                            headerDescription="Lorem ipsum explaining the topic"
                            headingSize="extraSmall"
                            statValue={56}
                            subValue={78}
                            suffix="%"
                            icon={null}
                        />
                        <IndicatorChart
                            className={_cs(styles.indicatorsCard, styles.indicatorsChart)}
                            heading="Indicator overview over the last 12 months"
                            headerDescription="Lorem ipsum"
                            chartData={indicatorData}
                        />
                        <ContainerCard
                            className={_cs(styles.indicatorsCard, styles.genderDisaggregation)}
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
                                        label={CustomLabel}
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
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ContainerCard>
                        <ContainerCard
                            className={_cs(styles.indicatorsCard, styles.ageDisaggregation)}
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
                                        label={CustomLabel}
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
                    heading="<Country-Name>"
                >
                    <div className={styles.countryDetails}>
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Population"
                            value="38,928,346"
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            labelContainerClassName={styles.labelText}
                            hideLabelColon
                            label="Internet access"
                            value={(
                                <>
                                    11.4%
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
                                    90%
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
                                    35%
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
                                    6.2
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
                                    11.8%
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
                                    37.5%
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
