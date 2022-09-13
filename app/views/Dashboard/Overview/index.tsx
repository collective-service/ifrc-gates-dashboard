import React, { useState } from 'react';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    ContainerCard,
    useModalState,
    Button,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import RegionalBreakdownCard from './RegionalBreakdownCard';
import PercentageCardGroup from './PercentageCardGroup';
import MapView from './MapView';
import OverviewTable from './OverviewTable';
import MapModal from './MapView/MapModal';
import { FilterType } from '../Filters';
import styles from './styles.css';

export type TabTypes = 'country' | 'overview' | 'combinedIndicators';
interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
}

function Overview(props: Props) {
    const {
        className,
        filterValues,
        setActiveTab,
        setFilterValues,
    } = props;

    // TODO: Rename this to better suit the behavior
    // TODO: define strict type mapMode and tableMode instead of string
    const [currentTab, setCurrentTab] = useState<string | undefined>('mapMode');

    // TODO: Map modal to be included in the mapbox.
    const [
        mapModalShown,
        showMapModal,
        hideMapModal,
    ] = useModalState(false);

    const noFiltersSelected = !filterValues?.region
        && !filterValues?.outbreak && !filterValues?.indicator;

    const onlyRegionSelected = !!filterValues?.region && (
        !filterValues?.indicator && !filterValues?.outbreak);

    const onlyOutbreakSelected = !!filterValues?.outbreak && (
        !filterValues?.indicator && !filterValues?.region);

    const onlyIndicatorSelected = !!filterValues?.indicator && (
        !filterValues?.outbreak && !filterValues?.region);

    const isIndicatorSelected = !!filterValues?.indicator;

    const moreThanTwoFilterSelected = (!!filterValues?.region && !!filterValues?.indicator)
        || (!!filterValues?.outbreak && !!filterValues?.indicator)
        || (!!filterValues?.region && !!filterValues?.outbreak);

    const uncertaintyChartActive = isIndicatorSelected;

    return (
        <div className={_cs(className, styles.overviewMain)}>
            {((onlyIndicatorSelected || onlyOutbreakSelected || moreThanTwoFilterSelected) && (
                <PercentageCardGroup
                    uncertaintyChartActive={uncertaintyChartActive}
                />
            ))}
            {((noFiltersSelected || onlyRegionSelected) && (
                <RegionalBreakdownCard
                    filterValues={filterValues}
                />
            ))}
            <div className={styles.areaChartBox}>
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
                            <MapView
                                isIndicatorSelected={isIndicatorSelected}
                            />
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
                        setActiveTab={setActiveTab}
                        setFilterValues={setFilterValues}
                    />
                )}
            </div>
        </div>
    );
}

export default Overview;
