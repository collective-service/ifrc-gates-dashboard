import React, { useState } from 'react';
import {
    IoCloudDownloadOutline,
} from 'react-icons/io5';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    DropdownMenu,
    DropdownMenuItem,
} from '@the-deep/deep-ui';
import { gql } from '@apollo/client';

import useSessionStorage from '#hooks/useSessionStorage';
import Overview from './Overview';
import Country from './Country';
import CombinedIndicators from './CombinedIndicators';
import Filters, { FilterType } from './Filters';
import { AdvancedOptionType } from './AdvancedFilters';
import styles from './styles.css';

export type TabTypes = 'country' | 'overview' | 'combinedIndicators';

export const COUNTRY_LIST = gql`
    query CountryList{
        countries {
            iso3
            countryName
            region
        }
    }
`;

function Dashboard() {
    const [activeTab, setActiveTab] = useSessionStorage<TabTypes | undefined>('activeTab', 'overview');
    const [filterValues, setFilterValues] = useState<FilterType | undefined>();
    const [
        advancedFilterValues,
        setAdvancedFilterValues,
    ] = useState<AdvancedOptionType | undefined>();

    const handleActiveTabChange = (newActiveTab: TabTypes | undefined) => {
        setActiveTab(newActiveTab);
        if (newActiveTab === 'country') {
            setFilterValues((oldFilterValues) => ({ ...oldFilterValues, country: 'AFG' }));
        }
    };

    const handleRawDataExportClick = () => {
        // FIXME: Handle onClick
        // eslint-disable-next-line no-console
        console.log('Handle raw data click');
    };

    const handleSummarizedDataExportClick = () => {
        // FIXME: Handle onClick
        // eslint-disable-next-line no-console
        console.log('Handle summarized data click');
    };

    const handleContextualCountryDataExportClick = () => {
        // FIXME: Handle onClick
        // eslint-disable-next-line no-console
        console.log('Handle contextual country data click');
    };

    return (
        <div className={styles.dashboardNavigation}>
            <Tabs
                value={activeTab}
                onChange={handleActiveTabChange}
                variant="secondary"
            >
                <div className={styles.dashboardButtons}>
                    <DropdownMenu
                        className={styles.button}
                        label="Export"
                        icons={<IoCloudDownloadOutline />}
                        variant="tertiary"
                    >
                        <DropdownMenuItem
                            name={undefined}
                            onClick={handleRawDataExportClick}
                        >
                            Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            name={undefined}
                            onClick={handleSummarizedDataExportClick}
                        >
                            Export Summarized Data
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            name={undefined}
                            onClick={handleContextualCountryDataExportClick}
                        >
                            Export Contextual Country Data
                        </DropdownMenuItem>
                    </DropdownMenu>
                    <TabList className={styles.dashboardTabList}>
                        <Tab
                            name="overview"
                            className={styles.defaultTabMode}
                            activeClassName={styles.activeTab}
                        >
                            Overview
                        </Tab>
                        <Tab
                            name="country"
                            className={styles.defaultTabMode}
                            activeClassName={styles.activeTab}
                        >
                            Country
                        </Tab>
                        <Tab
                            name="combinedIndicators"
                            className={styles.defaultTabMode}
                            activeClassName={styles.activeTab}
                        >
                            Combined Indicators
                        </Tab>
                    </TabList>
                </div>
                <Filters
                    activeTab={activeTab}
                    value={filterValues}
                    onChange={setFilterValues}
                    advancedFilterValues={advancedFilterValues}
                    setAdvancedFilterValues={setAdvancedFilterValues}
                />
                <div className={styles.content}>
                    <TabPanel name="overview">
                        <Overview
                            filterValues={filterValues}
                            setActiveTab={setActiveTab}
                            setFilterValues={setFilterValues}
                        />
                    </TabPanel>
                    <TabPanel name="country">
                        <Country
                            filterValues={filterValues}
                        />
                    </TabPanel>
                    <TabPanel
                        name="combinedIndicators"
                    >
                        <CombinedIndicators
                            filterValues={filterValues}
                            advancedFilterValues={advancedFilterValues}
                        />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default Dashboard;
