import React, { useMemo, useState } from 'react';
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
import { isDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';

import useSessionStorage from '#hooks/useSessionStorage';
import Narratives from '#components/Narratives';
import {
    NarrativeQuery,
    NarrativeQueryVariables,
    CountriesAndOutbreaksQuery,
    IndicatorsQuery,
    IndicatorsForCountryQuery,
    IndicatorsForCountryQueryVariables,
    SubvariablesQuery,
    SubvariablesQueryVariables,
    IndicatorsQueryVariables,
} from '#generated/types';
import { getRegionForCountry } from '#utils/common';

import Overview from './Overview';
import Country from './Country';
import CombinedIndicators from './CombinedIndicators';
import Filters, { FilterType } from './Filters';
import { AdvancedOptionType } from './AdvancedFilters';
import styles from './styles.css';

export type TabTypes = 'country' | 'overview' | 'combinedIndicators';

export const COUNTRIES_AND_OUTBREAKS = gql`
    query CountriesAndOutbreaks {
        countries {
            iso3
            countryName
            region
        }
        outBreaks {
            active
            outbreak
        }
    }
`;

const NARRATIVES = gql`
    query Narrative(
        $iso3: String,
    ) {
        naratives (
            filters: {
                iso3: $iso3,
            }
        ) {
            narrative
        }
    }
`;

const INDICATORS_FOR_COUNTRY = gql`
    query IndicatorsForCountry (
        $iso3: String!,
        $outbreak: String
    ) {
        filterOptions {
            countryIndicators(
                iso3: $iso3,
                outbreak: $outbreak,
            ) {
                indicatorId
                indicatorDescription
            }
        }
    }
`;

const INDICATORS = gql`
    query Indicators(
        $outbreak: String,
        $region: String,
    ) {
        filterOptions {
            overviewIndicators(
                outBreak: $outbreak,
                region: $region
            ) {
                indicatorId
                indicatorDescription
            }
        }
    }
`;

const SUBVARIABLES = gql`
    query Subvariables(
        $iso3: String!,
        $indicatorId:String
    ) {
        filterOptions {
            subvariables(iso3: $iso3, indicatorId: $indicatorId)
        }
    }
`;

function Dashboard() {
    const [
        activeTab,
        setActiveTab,
    ] = useSessionStorage<TabTypes | undefined>('activeTab', 'overview');
    const [
        filterValues,
        setFilterValues,
    ] = useState<FilterType | undefined>();
    const [
        advancedFilterValues,
        setAdvancedFilterValues,
    ] = useState<AdvancedOptionType | undefined>();

    const {
        data: countriesAndOutbreaks,
        loading: countriesAndOutbreaksLoading,
    } = useQuery<CountriesAndOutbreaksQuery>(
        COUNTRIES_AND_OUTBREAKS,
    );

    const filterValueCountry = filterValues?.country;

    const indicatorListForCountryVariables = useMemo(() => {
        if (isDefined(filterValueCountry)) {
            return {
                iso3: filterValueCountry,
                outbreak: filterValues?.outbreak,
            };
        }
        return undefined;
    }, [
        filterValueCountry,
        filterValues?.outbreak,
    ]);

    const {
        data: indicatorList,
        loading: indicatorsLoading,
    } = useQuery<IndicatorsForCountryQuery, IndicatorsForCountryQueryVariables>(
        INDICATORS_FOR_COUNTRY,
        {
            skip: !indicatorListForCountryVariables,
            variables: indicatorListForCountryVariables,
        },
    );

    const indicatorVariables = useMemo(() => {
        if (isDefined(filterValues?.region)) {
            return {
                outbreak: filterValues?.outbreak,
                region: filterValues?.region,
            };
        }
        return undefined;
    }, [
        filterValues?.outbreak,
        filterValues?.region,
    ]);

    const {
        data: globalIndicatorList,
        loading: globalIndicatorsLoading,
    } = useQuery<IndicatorsQuery, IndicatorsQueryVariables>(
        INDICATORS,
        {
            skip: !indicatorVariables,
            variables: indicatorVariables,
        },
    );

    const subvariablesVariables = useMemo(() => {
        if (isDefined(filterValues?.indicator) && isDefined(filterValueCountry)) {
            return {
                iso3: filterValueCountry,
                indicatorId: filterValues?.indicator,
            };
        }
        return undefined;
    }, [
        filterValueCountry,
        filterValues?.indicator,
    ]);

    const {
        data: subvariableList,
        loading: subvariablesLoading,
    } = useQuery<SubvariablesQuery, SubvariablesQueryVariables>(
        SUBVARIABLES,
        {
            skip: !subvariablesVariables,
            variables: subvariablesVariables,
            onCompleted: (response) => {
                if (response?.filterOptions?.subvariables?.[0]) {
                    setFilterValues((oldValue) => ({
                        ...oldValue,
                        subvariable: response?.filterOptions?.subvariables?.[0],
                    }));
                }
            },
        },
    );

    const handleActiveTabChange = (newActiveTab: TabTypes | undefined) => {
        setActiveTab(newActiveTab);
        if (newActiveTab === 'country') {
            setFilterValues((oldFilterValues) => {
                if (oldFilterValues?.country) {
                    return oldFilterValues;
                }

                const newValueForRegion = {
                    ...oldFilterValues,
                    country: 'AFG',
                    region: getRegionForCountry(
                        'AFG',
                        countriesAndOutbreaks?.countries ?? [],
                    ) ?? undefined,
                };
                return newValueForRegion;
            });
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

    const narrativeVariables = useMemo((): NarrativeQueryVariables => ({
        iso3: filterValues?.country,
    }), [
        filterValues?.country,
    ]);

    const {
        data: narrativeResponse,
    } = useQuery<NarrativeQuery, NarrativeQueryVariables>(
        NARRATIVES,
        {
            variables: narrativeVariables,
        },
    );

    const narrativeStatement = useMemo(() => ((
        narrativeResponse?.naratives?.length
            && narrativeResponse?.naratives?.length > 0
    )
        ? narrativeResponse?.naratives[0].narrative
        : 'This is narrative'
    ), [
        narrativeResponse?.naratives,
    ]);

    const selectedIndicatorName = useMemo(() => (
        globalIndicatorList?.filterOptions?.overviewIndicators
            ?.find((indicator) => indicator.indicatorId === filterValues?.indicator)
            ?.indicatorDescription
    ), [
        globalIndicatorList,
        filterValues?.indicator,
    ]);

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
                {/* TODO: 1 object will be fetched */}
                {activeTab !== 'overview' && (
                    <Narratives
                        narrative={narrativeStatement ?? 'No Narratives found'}
                    />
                )}
                <Filters
                    activeTab={activeTab}
                    value={filterValues}
                    onChange={setFilterValues}
                    advancedFilterValues={advancedFilterValues}
                    setAdvancedFilterValues={setAdvancedFilterValues}
                    countries={countriesAndOutbreaks?.countries}
                    emergencies={countriesAndOutbreaks?.outBreaks}
                    subvariableList={subvariableList}
                    globalIndicatorList={globalIndicatorList}
                    indicatorList={indicatorList}
                    emergenciesLoading={countriesAndOutbreaksLoading}
                    countriesLoading={countriesAndOutbreaksLoading}
                    subvariablesLoading={subvariablesLoading}
                    globalIndicatorsLoading={globalIndicatorsLoading}
                    indicatorsLoading={indicatorsLoading}
                />
                <div className={styles.content}>
                    <TabPanel name="overview">
                        <Overview
                            filterValues={filterValues}
                            setActiveTab={setActiveTab}
                            setFilterValues={setFilterValues}
                            selectedIndicatorName={selectedIndicatorName ?? undefined}
                            selectedOutbreakName={filterValues?.outbreak}
                        />
                    </TabPanel>
                    <TabPanel name="country">
                        <Country
                            filterValues={filterValues}
                            selectedIndicatorName={selectedIndicatorName ?? undefined}
                        />
                    </TabPanel>
                    <TabPanel name="combinedIndicators">
                        <CombinedIndicators
                            filterValues={filterValues}
                            advancedFilterValues={advancedFilterValues}
                            setFilterValues={setFilterValues}
                            setActiveTab={setActiveTab}
                        />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default Dashboard;
