import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    ContainerCard,
    CompactInformationCard,
    TextOutput,
} from '@the-deep/deep-ui';
/* import Map, {
    MapContainer,
    MapBounds,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map'; */
import {
    IoChevronForward,
} from 'react-icons/io5';

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
interface CountryProps {
    className?: string;
}

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

function Country(props: CountryProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.countryWrapper)}>
            <div className={styles.countryMain}>
                <div className={styles.countryDetailWrapper}>
                    <ContainerCard
                        className={styles.statusContainer}
                    >
                        <div className={styles.infoCards}>
                            <CompactInformationCard
                                icon={<IoChevronForward />}
                                label="Cases"
                                value={130}
                            />
                            <CompactInformationCard
                                icon={<IoChevronForward />}
                                label="Vaccination"
                                value={645}
                            />
                            <CompactInformationCard
                                icon={<IoChevronForward />}
                                label="Deaths"
                                value={100}
                            />
                        </div>
                    </ContainerCard>
                    <ContainerCard
                        className={styles.countryTrend}
                        heading="Outbreaks overview over the last 12 months"
                        headingSize="extraSmall"
                        contentClassName={styles.responsiveContent}
                    >
                        <ResponsiveContainer>
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
