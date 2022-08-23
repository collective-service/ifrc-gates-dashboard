import React, { useState } from 'react';
import {
    IoCloudDownloadOutline,
} from 'react-icons/io5';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    Button,
} from '@the-deep/deep-ui';

import Overview from './Overview';
import Country from './Country';
import CombinedIndicators from './CombinedIndicators';
import Filters, { FilterType } from './Filters';
import { AdvancedOptionType } from './AdvancedFilters';
import styles from './styles.css';

export type TabTypes = 'country' | 'overview' | 'combinedIndicators';

function Dashboard() {
    const [activeTab, setActiveTab] = useState<TabTypes | undefined>('overview');

    const handleExport = () => {
        // eslint-disable-next-line no-console
        console.log('Handled the export::>>');
    };

    const [filterValues, setFilterValues] = useState<FilterType | undefined>();

    const [
        advancedFilterValues,
        setAdvancedFilterValues,
    ] = useState<AdvancedOptionType | undefined>();

    return (
        <div className={styles.dashboardNavigation}>
            <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="secondary"
            >
                <div className={styles.dashboardButtons}>
                    <Button
                        className={styles.button}
                        icons={<IoCloudDownloadOutline />}
                        name={undefined}
                        variant="tertiary"
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                    <TabList className={styles.dashboardTabList}>
                        <Tab
                            className={styles.tabName}
                            name="overview"
                        >
                            Overview
                        </Tab>
                        <Tab
                            className={styles.tabName}
                            name="country"
                        >
                            Country
                        </Tab>
                        <Tab
                            className={styles.tabName}
                            name="combinedIndicators"
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
                        <Overview />
                    </TabPanel>
                    <TabPanel name="country">
                        <Country />
                    </TabPanel>
                    <TabPanel
                        name="combinedIndicators"
                    >
                        <CombinedIndicators />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default Dashboard;
