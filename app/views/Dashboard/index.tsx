import React, {
    useMemo,
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    Tabs,
    TabList,
    Tab,
    TabPanel,
    Header,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import { isDefined, isNotDefined } from '@togglecorp/fujs';

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
import {
    getRegionForCountry,
} from '#utils/common';
import useDebouncedValue from '#hooks/useDebouncedValue';

import Export from './Export';
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
        $indicatorId: String,
        $topics: [String!],
        $topicIsnull: Boolean,
        $thematicIsnull: Boolean,
        $indicatorIdIsnull: Boolean,
        $iso3Isnull: Boolean,
    ) {
        narratives (
            filters: {
                iso3: $iso3,
                indicatorId: $indicatorId,
                topics: $topics,
                topicIsnull: $topicIsnull,
                thematicIsnull: $thematicIsnull,
                indicatorIdIsnull: $indicatorIdIsnull,
                iso3Isnull: $iso3Isnull,
            }
        ) {
            id
            topic
            thematic
            narrative
            iso3
            indicatorId
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
                emergencies
                indicatorId
                indicatorDescription
                thematic
                topic
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
                emergencies
                indicatorId
                indicatorDescription
                thematic
                topic
                type
            }
        }
    }
`;

const SUBVARIABLES = gql`
    query Subvariables(
        $iso3: String!,
        $indicatorId: String!,
        $emergency: String!,
    ) {
        filterOptions {
            subvariables(
                iso3: $iso3,
                indicatorId: $indicatorId,
                emergency: $emergency,
            )
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

    const [keywordSearchText, setKeywordSearchText] = useState<string | undefined>();
    const searchText = useDebouncedValue(keywordSearchText);

    useEffect(() => {
        if (activeTab === 'country' && !filterValues) {
            setFilterValues({
                country: 'AFG',
                region: 'MENA',
            });
        }
    }, [activeTab, filterValues]);

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
        refetch: retriggerCountryIndicators,
    } = useQuery<IndicatorsForCountryQuery, IndicatorsForCountryQueryVariables>(
        INDICATORS_FOR_COUNTRY,
        {
            skip: !indicatorListForCountryVariables,
            variables: indicatorListForCountryVariables,
            onCompleted: (response) => {
                const isCurrentIndicatorNotInList = isNotDefined(
                    response?.filterOptions?.countryIndicators?.find(
                        (indicator) => indicator.indicatorId === filterValues?.indicator,
                    ),
                );
                if (isCurrentIndicatorNotInList) {
                    setFilterValues((oldValue) => ({
                        ...oldValue,
                        indicator: undefined,
                        subvariable: undefined,
                    }));
                }
            },
        },
    );

    const indicatorVariables = useMemo(() => ({
        outbreak: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
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
            onCompleted: (response) => {
                const isCurrentIndicatorNotInList = isNotDefined(
                    response?.filterOptions?.overviewIndicators?.find(
                        (indicator) => indicator.indicatorId === filterValues?.indicator,
                    ),
                );
                if (isCurrentIndicatorNotInList) {
                    setFilterValues((oldValue) => ({
                        ...oldValue,
                        indicator: undefined,
                        subvariable: undefined,
                    }));
                }
            },
        },
    );

    const subvariablesVariables = useMemo(() => {
        if (filterValues?.indicator) {
            return {
                iso3: (activeTab === 'country' ? filterValueCountry : undefined) ?? '',
                indicatorId: filterValues.indicator,
                emergency: filterValues.outbreak ?? '',
            };
        }
        return undefined;
    }, [
        activeTab,
        filterValueCountry,
        filterValues?.indicator,
        filterValues?.outbreak,
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
                const isSelectedValInList = (
                    response?.filterOptions?.subvariables?.findIndex(
                        (sv) => sv === filterValues?.subvariable,
                    ) ?? -1
                ) !== -1;

                if (!isSelectedValInList) {
                    setFilterValues((oldValue) => ({
                        ...oldValue,
                        subvariable: response?.filterOptions?.subvariables?.[0],
                    }));
                }
            },
        },
    );

    const selectedIndicatorList = (activeTab === 'country')
        ? indicatorList?.filterOptions?.countryIndicators
        : globalIndicatorList?.filterOptions?.overviewIndicators;

    const handleActiveTabChange = useCallback((newActiveTab: TabTypes | undefined) => {
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
            if (indicatorListForCountryVariables) {
                retriggerCountryIndicators();
            }
        } else if (newActiveTab === 'combinedIndicators') {
            if (isNotDefined(filterValues?.indicator)) {
                setAdvancedFilterValues({});
            }

            if (filterValues?.indicator && !(
                isNotDefined(advancedFilterValues?.type)
                && ((advancedFilterValues?.thematics?.length ?? 0) > 0)
                && ((advancedFilterValues?.topics?.length ?? 0) > 0)
            )) {
                const thematic = selectedIndicatorList?.find(
                    (item) => filterValues.indicator === item.indicatorId,
                )?.thematic;
                const topic = selectedIndicatorList?.find(
                    (item) => filterValues.indicator === item.indicatorId,
                )?.topic;
                const type = selectedIndicatorList?.find(
                    (item) => filterValues.indicator === item.indicatorId,
                )?.type;
                setAdvancedFilterValues({
                    topics: topic ? [topic] : undefined,
                    thematics: thematic ? [thematic] : undefined,
                    type: type ?? undefined,
                });
            }
        }
        setKeywordSearchText(undefined);
    }, [
        filterValues,
        advancedFilterValues,
        setActiveTab,
        selectedIndicatorList,
        countriesAndOutbreaks?.countries,
        retriggerCountryIndicators,
        indicatorListForCountryVariables,
    ]);

    const narrativeVariables = useMemo((): NarrativeQueryVariables => ({
        iso3: filterValues?.country ?? '',
        indicatorId: filterValues?.indicator,
        topics: advancedFilterValues?.topics,
        topicIsnull: isNotDefined(advancedFilterValues?.topics),
        indicatorIdIsnull: isNotDefined(filterValues?.indicator),
        iso3Isnull: isNotDefined(filterValues?.country),
        thematicIsnull: isNotDefined(advancedFilterValues?.thematics),
    }), [
        filterValues?.country,
        filterValues?.indicator,
        advancedFilterValues?.topics,
        advancedFilterValues?.thematics,
    ]);

    const {
        data: narrativeResponse,
    } = useQuery<NarrativeQuery, NarrativeQueryVariables>(
        NARRATIVES,
        {
            skip: activeTab === 'overview',
            variables: narrativeVariables,
        },
    );

    const narrativeStatement = useMemo(() => (
        narrativeResponse?.narratives[0]?.narrative
    ), [
        narrativeResponse?.narratives,
    ]);

    const selectedIndicatorName = useMemo(() => {
        const name = selectedIndicatorList
            ?.find((indicator) => indicator.indicatorId === filterValues?.indicator)
            ?.indicatorDescription ?? '';
        return name;
    }, [
        filterValues?.indicator,
        selectedIndicatorList,
    ]);

    const selectedIndicatorType = useMemo(() => (
        selectedIndicatorList
            ?.find((ind) => ind.indicatorId === filterValues?.indicator)
            ?.type as IndicatorType
    ), [
        filterValues?.indicator,
        selectedIndicatorList,
    ]);

    return (
        <div className={styles.dashboardNavigation}>
            <Tabs
                value={activeTab}
                onChange={handleActiveTabChange}
                variant="secondary"
            >
                <div className={styles.headerWrapper}>
                    <div className={styles.headerContainer}>
                        <Header
                            className={styles.headerText}
                            heading="Social Behaviour Dashboard on Public Health Emergency"
                            headingSize="extraLarge"
                        />
                        <div className={styles.dashboardButtons}>
                            <Export
                                className={styles.button}
                                indicatorId={filterValues?.indicator}
                                countryId={filterValueCountry}
                            />
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
                        {(activeTab !== 'overview' && narrativeResponse?.narratives) && (
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
                            keywordSearchText={searchText}
                            setKeywordSearchText={setKeywordSearchText}
                            countries={countriesAndOutbreaks?.countries}
                            emergencies={countriesAndOutbreaks?.outBreaks}
                            subvariableList={subvariableList}
                            indicatorList={selectedIndicatorList}
                            emergenciesLoading={countriesAndOutbreaksLoading}
                            countriesLoading={countriesAndOutbreaksLoading}
                            subvariablesLoading={subvariablesLoading}
                            indicatorsLoading={indicatorsLoading || globalIndicatorsLoading}
                        />
                    </div>
                </div>
                <div className={styles.content}>
                    <TabPanel name="overview">
                        <Overview
                            filterValues={filterValues}
                            setActiveTab={setActiveTab}
                            setFilterValues={setFilterValues}
                            selectedOutbreakName={filterValues?.outbreak}
                            selectedIndicatorName={selectedIndicatorName ?? undefined}
                            selectedIndicatorType={selectedIndicatorType ?? undefined}
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
                            keywordSearchText={searchText}
                        />
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default Dashboard;
