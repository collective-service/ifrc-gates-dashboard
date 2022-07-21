import React, { useState, useCallback } from 'react';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    Button,
} from '@the-deep/deep-ui';
import {
    IoFilterSharp,
    IoCloudDownloadOutline,
} from 'react-icons/io5';

import Overview from './Overview';
import Country from './Country';
import AdvancedFilterPane from './AdvancedFilterPane';
import styles from './styles.css';

function Dashboard() {
    const [filterView, setFilterView] = useState(false);

    const handleAdvancedFilterButtonClick = useCallback(() => {
        setFilterView((old) => !old);
    }, []);

    const handleExport = () => {
        // eslint-disable-next-line no-console
        console.log('Handled the export::>>');
    };

    return (
        <div className={styles.dashboardNavigation}>
            <Tabs
                useHash
                defaultHash="overview"
                variant="secondary"
            >
                <div className={styles.dashboardButtons}>
                    <div className={styles.filterAndExport}>
                        <Button
                            className={styles.button}
                            icons={<IoFilterSharp />}
                            name={undefined}
                            variant="tertiary"
                            onClick={handleAdvancedFilterButtonClick}
                        >
                            Filter
                        </Button>
                        <Button
                            className={styles.button}
                            icons={<IoCloudDownloadOutline />}
                            name={undefined}
                            variant="tertiary"
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    </div>
                    <TabList className={styles.dashboardTablist}>
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
                    </TabList>
                </div>
                <div className={styles.content}>
                    {filterView && (
                        <AdvancedFilterPane />
                    )}
                    <TabPanel
                        name="overview"
                    >
                        <Overview />
                    </TabPanel>
                    <TabPanel
                        name="country"
                    >
                        <Country />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default Dashboard;
