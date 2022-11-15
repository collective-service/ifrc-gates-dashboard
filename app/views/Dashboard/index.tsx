import React, {
    useMemo,
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    IoDownloadOutline,
    // IoCloseSharp,
} from 'react-icons/io5';
import { saveAs } from 'file-saver';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    // Button,
    DropdownMenu,
    DropdownMenuItem,
    ContainerCard,
} from '@the-deep/deep-ui';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
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
    ExportMetaQuery,
    ExportMetaQueryVariables,
} from '#generated/types';
import { getRegionForCountry } from '#utils/common';
import useRecursiveCsvExport from '#hooks/useRecursiveCSVExport';
import ProgressBar from '#components/ProgressBar';

import Overview from './Overview';
import Country from './Country';
import CombinedIndicators from './CombinedIndicators';
import Filters, { FilterType } from './Filters';
import { AdvancedOptionType } from './AdvancedFilters';

import styles from './styles.css';

export type TabTypes = 'country' | 'overview' | 'combinedIndicators';
export type IndicatorType = 'Contextual Indicators' | 'Social Behavioural Indicators';

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
                type
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
                type
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

const EXPORT_META = gql`
    query ExportMeta(
        $iso3: String,
        $indicatorId:String
    ) {
        exportMeta(
            iso3: $iso3,
            indicatorId: $indicatorId,
        ) {
            maxPageLimit
            totalCountryContextualDataCount
            totalRawDataCount
            totalSummaryCount
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

    useEffect(() => {
        if (activeTab === 'country' && !filterValues) {
            setFilterValues({ country: 'AFG' });
        }
    }, [activeTab, filterValues]);

    const filterValueCountry = filterValues?.country;

    const indicatorListForCountryVariables = useMemo(() => {
        if (isDefined(filterValueCountry)) {
            return {
                iso3: filterValueCountry,
                outbreak: filterValues?.outbreak,
                include_header: false,
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

    const exportParams = useMemo(() => {
        if (isDefined(filterValues?.indicator) || isDefined(filterValueCountry)) {
            return {
                iso3: filterValueCountry,
                indicator_id: filterValues?.indicator,
                include_header: false,
            };
        }
        return {};
    }, [
        filterValueCountry,
        filterValues?.indicator,
    ]);

    const [
        pendingExport,
        exportData,
        exportFullString,
        exportTotal,
        triggerExportStart,
        // handleCancelExport,
    ] = useRecursiveCsvExport({
        onFailure: () => {
            // eslint-disable-next-line no-console
            console.error('failed to download');
        },
    });

    const exportMetaVariables = useMemo(() => {
        if (isDefined(filterValues?.indicator) || isDefined(filterValueCountry)) {
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
        data: exportMetaCount,
        loading: exportMetaLoading,
    } = useQuery<ExportMetaQuery, ExportMetaQueryVariables>(
        EXPORT_META,
        {
            skip: !exportMetaVariables,
            variables: exportMetaVariables,
        },
    );

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

    const handleRawDataExportClick = useCallback(() => {
        if (exportMetaCount?.exportMeta?.totalRawDataCount) {
            triggerExportStart(
                'server://export-raw-data/',
                exportMetaCount?.exportMeta?.totalRawDataCount,
                exportParams,
            );
        }
    }, [
        exportParams,
        exportMetaCount,
        triggerExportStart,
    ]);

    const handleSummarizedDataExportClick = () => {
        if (exportMetaCount?.exportMeta?.totalSummaryCount) {
            triggerExportStart(
                'server://export-summary/',
                exportMetaCount?.exportMeta?.totalSummaryCount,
                exportParams,
            );
        }
    };

    const handleContextualCountryDataExportClick = () => {
        if (exportMetaCount?.exportMeta?.totalCountryContextualDataCount) {
            triggerExportStart(
                'server://export-country-contextual-data/',
                exportMetaCount?.exportMeta?.totalCountryContextualDataCount,
                exportParams,
            );
        }
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

    const narrativeStatement = useMemo(() => (
        narrativeResponse?.naratives[0]?.narrative
    ), [
        narrativeResponse?.naratives,
    ]);

    const selectedIndicatorList = (activeTab === 'country')
        ? indicatorList?.filterOptions?.countryIndicators
        : globalIndicatorList?.filterOptions?.overviewIndicators;

    const selectedIndicatorName = useMemo(() => {
        const name = selectedIndicatorList
            ?.find((indicator) => indicator.indicatorId === filterValues?.indicator)
            ?.indicatorDescription;
        return name;
    }, [
        filterValues?.indicator,
        selectedIndicatorList,
    ]);

    const selectedIndicatorType = useMemo(() => (
        indicatorList?.filterOptions?.countryIndicators
            ?.find((ind) => ind.indicatorId === filterValues?.indicator)
            ?.type as IndicatorType
    ), [
        filterValues?.indicator,
        indicatorList,
    ]);

    useEffect(() => {
        if (!pendingExport) {
            if (exportData?.length > 0) {
                if (exportData.length === exportTotal) {
                    /*
                    const dataString = stringify(exportData, {
                        columns: headers,
                    });
                    */
                    const blob = new Blob(
                        [exportFullString],
                        { type: 'text/csv' },
                    );
                    saveAs(blob, 'Data Export');
                } else {
                    // eslint-disable-next-line no-console
                    console.error('CSV num rows mismatch', `expected: ${exportTotal}`, `got: ${exportData.length}`);
                }
            }
        }
    }, [pendingExport, exportData, exportTotal, exportFullString]);

    const progress = useMemo(() => {
        if (!exportTotal) {
            return 0;
        }

        return Math.round(100 * (exportData?.length / exportTotal) ?? 0) / 100;
    }, [
        exportData,
        exportTotal,
    ]);

    const disableExportButton = exportMetaLoading
        || pendingExport
        || isNotDefined(filterValueCountry || filterValues?.indicator)
        || (
            (exportMetaCount?.exportMeta?.totalRawDataCount ?? 0) === 0
            && (exportMetaCount?.exportMeta?.totalSummaryCount ?? 0) === 0
            && (exportMetaCount?.exportMeta?.totalCountryContextualDataCount ?? 0) === 0
        );

    return (
        <div className={styles.dashboardNavigation}>
            <Tabs
                value={activeTab}
                onChange={handleActiveTabChange}
                variant="secondary"
            >
                <div className={styles.headerWrapper}>
                    <div className={styles.headerContainer}>
                        <ContainerCard
                            className={styles.headerText}
                            heading="Behavioural dashboard"
                            headingSize="large"
                        >
                            {/* This dashboard measures and tracks key social
                            behavioural data on COVID-19 from multiple research
                            projects conducted in the field or at the global level
                            by partners and academic communities. Its
                            aim is to help the RCCE community,
                            Collective Service partners and the coordination
                            team to analyse the situation at global, regional and country level. */}
                        </ContainerCard>
                        <div className={styles.dashboardButtons}>
                            <DropdownMenu
                                className={styles.button}
                                label={pendingExport ? `Preparing Export (${progress * 100}%)` : 'Export'}
                                variant="tertiary"
                                icons={<IoDownloadOutline />}
                                hideDropdownIcon
                                disabled={disableExportButton}
                            >
                                {(exportMetaCount?.exportMeta?.totalRawDataCount ?? 0) > 0 && (
                                    <DropdownMenuItem
                                        name={undefined}
                                        onClick={handleRawDataExportClick}
                                    >
                                        Export Raw Data as CSV
                                    </DropdownMenuItem>
                                )}
                                {(exportMetaCount?.exportMeta?.totalSummaryCount ?? 0) > 0 && (
                                    <DropdownMenuItem
                                        name={undefined}
                                        onClick={handleSummarizedDataExportClick}
                                    >
                                        Export Summarized Data
                                    </DropdownMenuItem>
                                )}
                                {(exportMetaCount
                                    ?.exportMeta
                                    ?.totalCountryContextualDataCount ?? 0) > 0
                                && (
                                    <DropdownMenuItem
                                        name={undefined}
                                        onClick={handleContextualCountryDataExportClick}
                                    >
                                        Export Contextual Country Data
                                    </DropdownMenuItem>
                                )}
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
                                    Browse Indicators
                                </Tab>
                            </TabList>
                        </div>
                        {/* TODO: 1 object will be fetched */}
                        {activeTab !== 'overview' && (
                            <Narratives
                                narrative={narrativeStatement}
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
                    </div>
                </div>
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
                            selectedIndicatorType={selectedIndicatorType ?? undefined}
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
            {pendingExport && (
                <div className={styles.exportProgressBar}>
                    <div className={styles.topContainer}>
                        Preparing Export...
                        {/*
                            <Button
                                name={undefined}
                                icons={<IoCloseSharp />}
                                className={styles.cancelExportButton}
                                onClick={handleCancelExport}
                                variant="transparent"
                            >
                                Cancel
                            </Button>
                        */}
                    </div>
                    <ProgressBar
                        className={styles.progressBar}
                        color="var(--dui-color-brand)"
                        title={undefined}
                        barName={undefined}
                        value={progress}
                        totalValue={1}
                        format="percent"
                    />
                </div>
            )}
        </div>
    );
}

export default Dashboard;
