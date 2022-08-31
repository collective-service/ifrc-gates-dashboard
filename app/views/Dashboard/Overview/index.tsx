import React, { useState } from 'react';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    ContainerCard,
    Button,
    useModalState,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import RegionalBreakdownCard from './RegionalBreakdownCard';
import PercentageCardGroup from './PercentageCardGroup';
import UncertainityChart from './UncertainityChart';
import MapView from './MapView';
import OverviewTable from './OverviewTable';
import MapModal from './MapView/MapModal';
import styles from './styles.css';

interface Props {
    className?: string;
}

function Overview(props: Props) {
    const {
        className,
    } = props;

    // TODO: Rename this to better suit the behavior
    // TODO: define strict type mapMode and tableMode instead of string
    const [currentTab, setCurrentTab] = useState<string | undefined>('mapMode');

    const [
        mapModalShown,
        showMapModal,
        hideMapModal,
    ] = useModalState(false);

    return (
        <div className={_cs(className, styles.overviewMain)}>
            <PercentageCardGroup />
            <RegionalBreakdownCard />
            <div className={styles.areaChartBox}>
                <UncertainityChart />
                <Button
                    name="map_modal"
                    onClick={showMapModal}
                    variant="nlp-tertiary"
                >
                    Map Modal
                </Button>
            </div>
            <div className={styles.mapContainer}>
                <Tabs
                    value={currentTab}
                    onChange={setCurrentTab}
                    variant="secondary"
                >
                    <ContainerCard
                        spacing="none"
                        heading={currentTab === 'mapMode' ? 'Overview map' : 'Overview Table'}
                        headingSize="medium"
                        headingContainerClassName={styles.mapHeaderContainer}
                        headerActionsContainerClassName={styles.mapActionTabs}
                        headerActions={(
                            <TabList className={styles.dashboardTabList}>
                                <Tab
                                    name="mapMode"
                                    className={styles.defaultTabMode}
                                    activeClassName={styles.activeTab}
                                >
                                    Map overview
                                </Tab>
                                <Tab
                                    name="tableMode"
                                    className={styles.defaultTabMode}
                                    activeClassName={styles.activeTab}
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
                            <OverviewTable />
                        </TabPanel>
                    </ContainerCard>
                </Tabs>
                {mapModalShown && (
                    <MapModal
                        onModalClose={hideMapModal}
                    />
                )}
            </div>
        </div>
    );
}

export default Overview;
