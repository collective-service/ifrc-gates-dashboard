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
/* import Map, {
    MapContainer,
    MapBounds,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map'; */
import StatusCard, { Props as StatusCardProps } from '#components/StatusCard';

import IndicatorChart from '#components/IndicatorChart';
import PercentageStats from '#components/PercentageStats';
import CustomLabel from '#components/CustomLabel';

import styles from './styles.css';

/* const lightStyle = 'mapbox://styles/togglecorp/cl50rwy0a002d14mo6w9zprio';

const countryFillPaint: mapboxgl.FillPaint = {
    'fill-color': '#354052', // empty color
    'fill-opacity': 0.2,
};

const countryLinePaint: mapboxgl.LinePaint = {
    'line-color': '#ffffff',
    'line-width': 1,
};
*/

const keySelector = (d: StatusCardProps) => d.statusId;

const indicatorData = [
    {
        id: 1,
        month: 'Jan',
        percentage: 10,
    },
    {
        id: 2,
        month: 'Feb',
        percentage: 15,
    },
    {
        id: 3,
        month: 'Mar',
        percentage: 20,
    },
    {
        id: 4,
        month: 'Apr',
        percentage: 25,
    },
    {
        id: 5,
        month: 'May',
        percentage: 35,
    },
    {
        id: 6,
        month: 'Jun',
        percentage: 15,
    },
    {
        id: 7,
        month: 'Jul',
        percentage: 25,
    },
    {
        id: 8,
        month: 'Aug',
        percentage: 55,
    },
    {
        id: 9,
        month: 'Sept',
        percentage: 50,
    },
    {
        id: 10,
        month: 'Oct',
        percentage: 45,
    },
    {
        id: 11,
        month: 'Nov',
        percentage: 65,
    },
    {
        id: 12,
        month: 'Dec',
        percentage: 5,
    },
];

const outbreakData = [
    {
        month: 'Jan',
        covid: 20,
        monkeyPox: 5,
    },
    {
        month: 'Feb',
        covid: 30,
        monkeyPox: 15,
    },
    {
        month: 'Mar',
        covid: 35,
        monkeyPox: 20,
    },
    {
        month: 'Apr',
        covid: 25,
        monkeyPox: 25,
    },
    {
        month: 'May',
        covid: 40,
        monkeyPox: 35,
    },
    {
        month: 'Jun',
        covid: 45,
        monkeyPox: 15,
    },
    {
        month: 'Jul',
        covid: 55,
        monkeyPox: 25,
    },
    {
        month: 'Aug',
        covid: 65,
        monkeyPox: 55,
    },
    {
        month: 'Sept',
        covid: 70,
        monkeyPox: 50,
    },
    {
        month: 'Oct',
        covid: 65,
        monkeyPox: 45,
    },
    {
        month: 'Nov',
        covid: 80,
        monkeyPox: 65,
    },
    {
        month: 'Dec',
        covid: 60,
        monkeyPox: 5,
    },

];

const statusData: StatusCardProps[] = [
    {
        statusId: 1,
        title: 'Total number of deaths',
        value: 189050,
        regionalValue: 1,
    },
    {
        statusId: 2,
        title: 'Total outbreaks for country',
        value: 2,
        regionalValue: 167.3,
    },
    {
        statusId: 3,
        title: 'Total number of cases',
        value: 2,
        regionalValue: 65,
    },
    {
        statusId: 4,
        title: 'New cases per million',
        value: 56.8,
        regionalValue: 167.3,
    },
];

interface CountryProps {
    className?: string;
}
const genderDisaggregationData = [
    {
        id: 1,
        gender: 'Male',
        percentage: 40,
    },
    {
        id: 2,
        gender: 'Female',
        percentage: 40,
    },
    {
        id: 3,
        gender: 'other',
        percentage: 20,
    },
];

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
                    headerIcons={(
                        // FIX ME: COUNTRY AVATAR
                        <img src="https://picsum.photos/50" alt="country-avatar" />
                    )}
                    headingSize="small"
                    heading="<Country-Name>"
                >
                    <div className={styles.countryDetails}>
                        <div className={styles.countryMap}>
                            {/* FIX ME: COUNTRY MAP */}
                            <img
                                src="https://picsum.photos/350/200"
                                alt="Country-logo"
                            />
                        </div>
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            label="Population"
                            value="38,928,346"
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            label="Internet access"
                            value={(
                                <>
                                    11.4%
                                    <div className={styles.regionalText}>
                                        [regional- 30%]
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            label="Literacy rate"
                            value={(
                                <>
                                    90%
                                    <div className={styles.regionalText}>
                                        [regional- 30%]
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            hideLabelColon
                            label={(
                                <p>
                                    Access to basic
                                    <br />
                                    washing facilities:
                                </p>
                            )}
                            value={(
                                <>
                                    35%
                                    <div className={styles.regionalText}>
                                        [regional- 30%]
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            hideLabelColon
                            label={(
                                <p>
                                    Doctors and nurses
                                    <br />
                                    per 1000 people:
                                </p>
                            )}
                            value={(
                                <>
                                    6.2
                                    <div className={styles.regionalText}>
                                        [regional- 30%]
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            label="Stringency"
                            value={(
                                <>
                                    11.8%
                                    <div className={styles.regionalText}>
                                        [regional- 30%]
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            label="Regional cases %"
                            value={(
                                <>
                                    34%
                                    <div className={styles.regionalText}>
                                        [regional- 30%]
                                    </div>
                                </>
                            )}
                        />
                        <TextOutput
                            className={styles.countryTextOutput}
                            valueContainerClassName={styles.valueText}
                            label="Economic support index"
                            value={(
                                <>
                                    37.5%
                                    <div className={styles.regionalText}>
                                        [regional- 30%]
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
