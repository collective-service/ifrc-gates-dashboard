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
import { TabTypes, IndicatorType } from '..';
import styles from './styles.css';

function getMapSubHeader(
    indicatorId: string,
    selectedIndicatorName: string,
    outbreakId: string | undefined,
    selectedOutbreakName: string | undefined,
) {
    if (outbreakId) {
        return `${selectedIndicatorName ?? indicatorId} for ${selectedOutbreakName ?? outbreakId} - Latest available data`;
    }
    return `${selectedIndicatorName ?? indicatorId} - Latest available data`;
}

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;

    selectedIndicatorName: string | undefined;
    selectedOutbreakName: string | undefined;
    selectedIndicatorType: IndicatorType | undefined;
}

function Overview(props: Props) {
    const {
        className,
        filterValues,
        setActiveTab,
        setFilterValues,

        selectedIndicatorName,
        selectedIndicatorType,
        selectedOutbreakName,
    } = props;

    const [currentTab, setCurrentTab] = useState<
        'mapMode' | 'tableMode' | undefined
    >('mapMode');

    const regionId = filterValues?.region;
    const indicatorId = filterValues?.indicator;
    const outbreakId = filterValues?.outbreak;
    const subvariableId = filterValues?.subvariable;

    const noFiltersSelected = !regionId && !outbreakId && !indicatorId;

    const onlyRegionSelected = !!regionId && !indicatorId && !outbreakId;
    const onlyOutbreakSelected = !!outbreakId && !indicatorId && !regionId;
    const onlyIndicatorSelected = !!indicatorId && !outbreakId && !regionId;

    // FIXME: this can be simplified
    const moreThanTwoFilterSelected = (!!regionId && !!indicatorId)
        || (!!outbreakId && !!indicatorId)
        || (!!regionId && !!outbreakId);

    const isIndicatorSelected = !!indicatorId;

    const indicatorIdForOverviewMapAndTable = indicatorId ?? 'new_cases_per_million';
    const indicatorNameForOverviewMapAndTable = indicatorId
        ? (selectedIndicatorName ?? indicatorId)
        : 'New cases per million by country';

    return (
        <div className={_cs(className, styles.overviewMain)}>
            {((onlyIndicatorSelected || onlyOutbreakSelected || moreThanTwoFilterSelected) && (
                <PercentageCardGroup
                    uncertaintyChartActive={isIndicatorSelected && selectedIndicatorType === 'Social Behavioural Indicators'}
                    filterValues={filterValues}
                    selectedIndicatorName={selectedIndicatorName}
                    selectedOutbreakName={selectedOutbreakName}
                    selectedIndicatorType={selectedIndicatorType}
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
                        heading={
                            currentTab === 'mapMode'
                                ? 'Overview Map'
                                : 'Overview Table'
                        }
                        headingSize="small"
                        headingSectionClassName={styles.mapSectionHeader}
                        headingContainerClassName={styles.mapHeaderContainer}
                        headingDescription={getMapSubHeader(
                            indicatorIdForOverviewMapAndTable,
                            indicatorNameForOverviewMapAndTable,
                            outbreakId,
                            selectedOutbreakName,
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
                        <TabPanel name="mapMode">
                            <MapView
                                selectedIndicatorName={indicatorNameForOverviewMapAndTable}
                                indicatorId={indicatorIdForOverviewMapAndTable}
                                regionId={regionId}
                                outbreakId={outbreakId}
                                subvariableId={subvariableId}
                                setActiveTab={setActiveTab}
                                setFilterValues={setFilterValues}
                                indicatorExplicitlySet={!!indicatorId}
                                filterValues={filterValues}
                                selectedIndicatorType={selectedIndicatorType ?? undefined}
                            />
                        </TabPanel>
                        <TabPanel name="tableMode">
                            <OverviewTable
                                indicatorId={indicatorIdForOverviewMapAndTable}
                                outbreakId={outbreakId}
                                regionId={regionId}
                                subvariableId={subvariableId}
                            />
                        </TabPanel>
                    </ContainerCard>
                </Tabs>
            </div>
        </div>
    );
}

export default Overview;
