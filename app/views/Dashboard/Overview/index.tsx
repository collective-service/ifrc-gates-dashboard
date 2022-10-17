import React, { useState } from 'react';
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
import OverviewTable from './OverviewTable';
import { FilterType } from '../Filters';
import { TabTypes } from '..';
import styles from './styles.css';

function MapSubHeader(
    filterValues?: FilterType | undefined,
    selectedIndicatorName?: string | undefined,
    selectedOutbreakName?: string | undefined,
) {
    if (filterValues?.indicator && filterValues?.outbreak) {
        return `${selectedIndicatorName ?? filterValues?.indicator} for ${selectedOutbreakName ?? filterValues?.outbreak} - Latest available data`;
    }
    if (filterValues?.indicator) {
        return `${selectedIndicatorName ?? filterValues?.indicator} - Latest available data`;
    }
    if (filterValues?.outbreak) {
        return `New cases per million by country for ${selectedOutbreakName ?? filterValues?.outbreak}`;
    }
    return 'New cases per million by country';
}

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    selectedIndicatorName: string | undefined;
    selectedOutbreakName: string | undefined;
}

function Overview(props: Props) {
    const {
        className,
        filterValues,
        setActiveTab,
        setFilterValues,
        selectedIndicatorName,
        selectedOutbreakName,
    } = props;

    // TODO: Rename this to better suit the behavior
    // TODO: define strict type mapMode and tableMode instead of string
    const [currentTab, setCurrentTab] = useState<string | undefined>('mapMode');

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
                    filterValues={filterValues}
                    selectedIndicatorName={selectedIndicatorName}
                    selectedOutbreakName={selectedOutbreakName}
                />
            ))}
            {((noFiltersSelected || onlyRegionSelected) && (
                <RegionalBreakdownCard
                    filterValues={filterValues}
                />
            ))}
            <div className={styles.mapContainer}>
                <Tabs
                    value={currentTab}
                    onChange={setCurrentTab}
                    variant="secondary"
                >
                    <ContainerCard
                        spacing="none"
                        heading={currentTab === 'mapMode' ? 'Overview map' : 'Overview Table'}
                        headingSize="small"
                        headingContainerClassName={styles.mapHeaderContainer}
                        headingDescription={currentTab === 'mapMode'
                            && MapSubHeader(
                                filterValues, selectedIndicatorName, selectedOutbreakName,
                            )}
                        headerActionsContainerClassName={styles.mapActionTabs}
                        headerActions={(
                            <TabList className={styles.dashboardTabList}>
                                <Tab
                                    name="mapMode"
                                    className={styles.defaultTabMode}
                                    activeClassName={styles.activeTab}
                                >
                                    Map
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
                                filterValues={filterValues}
                                setActiveTab={setActiveTab}
                                setFilterValues={setFilterValues}
                            />
                        </TabPanel>
                        <TabPanel
                            name="tableMode"
                        >
                            <OverviewTable
                                filterValues={filterValues}
                            />
                        </TabPanel>
                    </ContainerCard>
                </Tabs>
            </div>
        </div>
    );
}

export default Overview;
