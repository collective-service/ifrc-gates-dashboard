import React, { useState } from 'react';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    ContainerCard,
    CompactInformationCard,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from 'recharts';
import {
    IoBookmark,
} from 'react-icons/io5';

import MapView from './MapView';
import styles from './styles.css';

interface OverviewProps {
    className?: string;
}

const lineChartData = [
    {
        name: 'Mar',
        uv: 4000,
        pv: 2400,
        amt: 2400,
        range: 3500,
    },
    {
        name: 'Apr',
        uv: 3000,
        pv: 1398,
        amt: 2210,
        range: 1004,
    },
    {
        name: 'May',
        uv: 2000,
        pv: 9800,
        amt: 2290,
        range: 1580,
    },
    {
        name: 'June',
        uv: 2780,
        pv: 3908,
        amt: 2000,
        range: 3000,
    },
    {
        name: 'July',
        uv: 1890,
        pv: 4800,
        amt: 2181,
        range: 2600,
    },
    {
        name: 'Aug',
        uv: 2390,
        pv: 3800,
        amt: 2500,
        range: 3900,
    },
    {
        name: 'Sept',
        uv: 3490,
        pv: 4300,
        amt: 2100,
        range: 2900,
    },
];

const barChartData = [
    {
        name: 'USA',
        range: '400M',
        pv: 2400,
        amt: 1900,
    },
    {
        name: 'Asia',
        range: '300M',
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'ESAR',
        range: '200M',
        pv: 9800,
        amt: 2010,
    },
    {
        name: 'Eur',
        range: '270M',
        pv: 3908,
        amt: 1800,
    },
    {
        name: 'MENA',
        range: '170M',
        pv: 4800,
        amt: 1181,
    },
    {
        name: 'WCAR',
        range: '290M',
        pv: 3800,
        amt: 2200,
    },
    {
        name: 'Rus',
        range: '210M',
        pv: 4300,
        amt: 2100,
    },
];

function Overview(props: OverviewProps) {
    const {
        className,
    } = props;

    const [currentTab, setCurrentTab] = useState<string | undefined>('mapMode');

    return (
        <div className={_cs(className, styles.overviewMain)}>
            <div className={styles.cardCollection}>
                <ContainerCard
                    className={_cs(styles.globalSurgeCard, styles.cardInfo)}
                    heading="Total number of cases"
                    headingSize="extraSmall"
                    headerDescription={(
                        <p>
                            All Outbreak numbers:
                        </p>
                    )}
                >
                    <CompactInformationCard
                        className={styles.statCard}
                        icon={<IoBookmark />}
                        label="Approx."
                        spacing="loose"
                        value={140}
                    />
                </ContainerCard>
                <ContainerCard
                    className={_cs(styles.trendsCard, styles.cardInfo)}
                    heading="Outbreak over last 12 months"
                    headingSize="extraSmall"
                    contentClassName={styles.responsiveContent}
                    headerDescription="Average indicator value weighted by country's populations"
                >
                    <ResponsiveContainer className={styles.responsiveContainer}>
                        <LineChart
                            // width={500}
                            // height={100}
                            data={lineChartData}
                            margin={{
                                right: 20,
                            }}
                        >
                            <XAxis dataKey="name" tickLine={false} />
                            <YAxis tickLine={false} />
                            <Tooltip
                                allowEscapeViewBox={{
                                    x: true,
                                    y: true,
                                }}
                            />
                            <Legend iconType="square" />
                            <Line
                                type="monotone"
                                dataKey="pv"
                                stroke="#4bda8a"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="uv"
                                stroke="#2169bb"
                            />
                            <Line
                                type="monotone"
                                dataKey="amt"
                                stroke="#d2e82d"
                            />
                            <Line
                                type="monotone"
                                dataKey="range"
                                stroke="#ba2123"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ContainerCard>
                <ContainerCard
                    className={_cs(styles.regionsCard, styles.cardInfo)}
                    contentClassName={styles.responsiveContent}
                    heading="Regional Breakdown"
                    headingSize="extraSmall"
                    headerDescription="Average indicator value weighted by country's populations (Apr 2022)"
                >
                    <ResponsiveContainer className={styles.responsiveContainer}>
                        <BarChart
                            data={barChartData}
                        >
                            <Tooltip
                                allowEscapeViewBox={{
                                    x: true,
                                    y: true,
                                }}
                            />
                            <XAxis dataKey="name" tickLine={false}>
                                <LabelList dataKey="name" position="bottom" />
                            </XAxis>
                            <Bar dataKey="amt" fill="#38c073">
                                <LabelList dataKey="range" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ContainerCard>
            </div>
            <div className={styles.mapContainer}>
                <Tabs
                    value={currentTab}
                    onChange={(tabName: string | undefined) => setCurrentTab(tabName)}
                >
                    <ContainerCard
                        heading={currentTab === 'mapMode' ? 'Overview map' : 'Tabular data'}
                        headingSize="extraSmall"
                        headerDescription={currentTab === 'mapMode'
                            ? 'Overview of the average indicator value weighted by  populations'
                            : 'Interpretation of the data in table'}
                        headerActions={(
                            <TabList>
                                <Tab
                                    name="mapMode"
                                >
                                    Map overview
                                </Tab>
                                <Tab
                                    name="tableMode"
                                >
                                    Table
                                </Tab>
                            </TabList>
                        )}
                    >
                        <TabPanel
                            name="mapMode"
                        >
                            <MapView />
                        </TabPanel>
                        <TabPanel
                            name="tableMode"
                        >
                            Tabular component here---------------
                        </TabPanel>
                    </ContainerCard>
                </Tabs>
            </div>
        </div>
    );
}

export default Overview;
