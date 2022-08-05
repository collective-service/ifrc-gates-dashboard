import React, { useState, useCallback } from 'react';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    ContainerCard,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import RegionalBreakdownCard from './RegionalBreakdownCard';
import PercentageCardGroup from './PercentageCardGroup';
import MapView from './MapView';
import TableView from './TableView';
import styles from './styles.css';

interface OverviewProps {
    className?: string;
}

function Overview(props: OverviewProps) {
    const {
        className,
    } = props;

    const [currentTab, setCurrentTab] = useState<string | undefined>('mapMode');

    const handleMapView = useCallback(
        (tabName: string | undefined) => {
            setCurrentTab(tabName);
        },
        [],
    );

    return (
        <div className={_cs(className, styles.overviewMain)}>
            <PercentageCardGroup />
            <RegionalBreakdownCard />
            <div className={styles.mapContainer}>
                <Tabs
                    value={currentTab}
                    onChange={handleMapView}
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
