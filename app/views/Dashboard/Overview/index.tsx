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
import TableView from './TableView';
import styles from './styles.css';

interface OverviewProps {
    className?: string;
}

const lineChartData = [
    {
        name: 'Mar',
        Covid: 80,
        MonkeyPox: 24,
        SpanishFlu: 24,
        Ebola: 35,
    },
    {
        name: 'Apr',
        Covid: 30,
        MonkeyPox: 13,
        SpanishFlu: 22,
        Ebola: 10,
    },
    {
        name: 'May',
        Covid: 90,
        MonkeyPox: 98,
        SpanishFlu: 22,
        Ebola: 58,
    },
    {
        name: 'June',
        Covid: 78,
        MonkeyPox: 90,
        SpanishFlu: 20,
        Ebola: 30,
    },
    {
        name: 'July',
        Covid: 89,
        MonkeyPox: 48,
        SpanishFlu: 28,
        Ebola: 26,
    },
    {
        name: 'Aug',
        Covid: 90,
        MonkeyPox: 80,
        SpanishFlu: 50,
        Ebola: 39,
    },
    {
        name: 'Sept',
        Covid: 90,
        MonkeyPox: 43,
        SpanishFlu: 21,
        Ebola: 29,
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
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                padding={{ top: 30 }}
                            />
                            <Tooltip
                                allowEscapeViewBox={{
                                    x: true,
                                    y: true,
                                }}
                            />
                            <Legend
                                iconType="square"
                                align="right"
                            />
                            <Line
                                type="monotone"
                                dataKey="MonkeyPox"
                                stroke="#4bda8a"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="Covid"
                                stroke="#2169bb"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="SpanishFlu"
                                stroke="#d2e82d"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="Ebola"
                                stroke="#ba2123"
                                strokeWidth={2}
                                dot={false}
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
                            <TableView />
                        </TabPanel>
                    </ContainerCard>
                </Tabs>
            </div>
        </div>
    );
}

export default Overview;
