import React, { useCallback, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import Highlighter from 'react-highlight-words';

import {
    _cs,
    doesObjectHaveNoData,
    isDefined,
    isNotDefined,
    caseInsensitiveSubmatch,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    List,
    ListView,
} from '@the-deep/deep-ui';
import {
    IoFileTraySharp,
} from 'react-icons/io5';

import {
    CountryCombinedIndicatorsQuery,
    CountryCombinedIndicatorsQueryVariables,
    RegionalCombinedIndicatorsQuery,
    RegionalCombinedIndicatorsQueryVariables,
    GlobalCombinedIndicatorsQuery,
    GlobalCombinedIndicatorsQueryVariables,
} from '#generated/types';
import { TabTypes } from '#views/Dashboard';

import TopicCard from './TopicCard';
import { AdvancedOptionType } from '../AdvancedFilters';
import { FilterType } from '../Filters';
import styles from './styles.css';

const COUNTRY_COMBINED_INDICATORS = gql`
    query CountryCombinedIndicators (
        $emergency: String,
        $iso3: String,
        $topics:[String!],
        $thematics:[String!],
        $type: String
    ) {
        countryCombinedIndicators (filters: {
            emergency: $emergency,
            iso3: $iso3,
            topics: $topics,
            thematics: $thematics,
            type: $type,
        }) {
            thematic
            thematicDescription
            topics {
                indicators {
                    emergency
                    indicatorId
                    indicatorName
                    indicatorDescription
                    indicatorValueRegional
                    indicatorMonth
                    indicatorValue
                    region
                    subvariable
                    format
                }
                topicDescription
                topicName
            }
        }
    }
`;

export type CountryIndicatorType = NonNullable<CountryCombinedIndicatorsQuery['countryCombinedIndicators']>[number];

const REGIONAL_COMBINED_INDICATORS = gql`
    query RegionalCombinedIndicators (
        $emergency: String,
        $region: String,
        $topics: [String!],
        $thematics: [String!],
        $type: String
    ) {
        regionCombinedIndicators (filters: {
            emergency: $emergency,
            region: $region,
            topics: $topics,
            thematics: $thematics,
            type: $type,
        }) {
            thematic
            thematicDescription
            topics {
                indicators {
                    emergency
                    indicatorId
                    indicatorName
                    indicatorMonth
                    indicatorDescription
                    indicatorValueRegional
                    indicatorValue
                    region
                    subvariable
                    format
                }
                topicDescription
                topicName
            }
        }
    }
`;

export type RegionalIndicatorType = NonNullable<RegionalCombinedIndicatorsQuery['regionCombinedIndicators']>[number];

const GLOBAL_COMBINED_INDICATORS = gql`
    query GlobalCombinedIndicators(
        $emergency: String,
        $type: String,
        $thematics: [String!],
        $topics: [String!],
    ) {
        globalCombinedIndicators(filters: {
            topics: $topics,
            thematics: $thematics,
            type: $type,
            emergency: $emergency,
        }) {
            thematic
            thematicDescription
            topics {
                indicators {
                    emergency
                    indicatorId
                    indicatorName
                    indicatorDescription
                    indicatorValueRegional
                    indicatorValue
                    region
                    indicatorMonth
                    subvariable
                    format
                }
                topicDescription
                topicName
            }
        }
    }
`;

export type GlobalIndicatorType = NonNullable<GlobalCombinedIndicatorsQuery['globalCombinedIndicators']>[number];

export type TopicIndicatorType = NonNullable<
    | GlobalIndicatorType['topics']
    | CountryIndicatorType['topics']
    | RegionalIndicatorType['topics']
>[number];

export type IndicatorType = NonNullable<TopicIndicatorType['indicators']>[number];

interface ThematicProps {
    thematicName: string;
    thematicDescription: string | undefined;
    indicators: TopicIndicatorType[] | undefined;
    showRegionalValue: boolean;
    filterValues: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    includedTopics: (string | undefined)[] | undefined;
    includedIndicators: string[] | undefined;
    includedSubvariables: string[] | undefined;
    searchText: string | undefined;
}

function ThematicRenderer(props: ThematicProps) {
    const {
        thematicName,
        thematicDescription,
        indicators,
        showRegionalValue,
        filterValues,
        setFilterValues,
        setActiveTab,
        includedTopics,
        includedIndicators,
        includedSubvariables,
        searchText,
    } = props;

    const topicKeySelector = (d: TopicIndicatorType) => d.topicName;

    const topicRendererParams = useCallback((_: string, data: TopicIndicatorType) => ({
        topicName: data.topicName,
        topicDescription: (data.topicName !== data.topicDescription)
            ? (data.topicDescription ?? undefined) : undefined,
        indicators: data.indicators ?? undefined,
        includedIndicators,
        includedSubvariables,
        showRegionalValue,
        filterValues,
        setFilterValues,
        setActiveTab,
        searchText,
    }), [
        showRegionalValue,
        setActiveTab,
        filterValues,
        setFilterValues,
        includedIndicators,
        includedSubvariables,
        searchText,
    ]);

    const filteredIndicatorsList = useMemo(() => (
        indicators?.filter(
            (indicator) => includedTopics?.includes(indicator?.topicName),
        )
    ), [
        indicators,
        includedTopics,
    ]);

    return (
        <div className={styles.thematicContainer}>
            <ContainerCard
                className={styles.thematicHeader}
                heading={(
                    <Highlighter
                        searchWords={[searchText ?? '']}
                        autoEscape
                        textToHighlight={thematicName}
                    />
                )}
                headerDescription={(
                    <Highlighter
                        searchWords={[searchText ?? '']}
                        autoEscape
                        textToHighlight={thematicDescription ?? ''}
                    />
                )}
            />
            <List
                data={filteredIndicatorsList}
                keySelector={topicKeySelector}
                renderer={TopicCard}
                rendererParams={topicRendererParams}
            />
        </div>
    );
}

interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
    advancedFilterValues?: AdvancedOptionType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    keywordSearchText: string | undefined;
}

function CombinedIndicators(props: Props) {
    const {
        className,
        filterValues,
        advancedFilterValues,
        setFilterValues,
        setActiveTab,
        keywordSearchText,
    } = props;

    const countryCombinedVariables = useMemo((): CountryCombinedIndicatorsQueryVariables => ({
        iso3: filterValues?.country,
        emergency: filterValues?.outbreak,
        type: advancedFilterValues?.type,
        thematics: advancedFilterValues?.thematics,
        topics: advancedFilterValues?.topics,
    }), [
        filterValues?.country,
        filterValues?.outbreak,
        advancedFilterValues?.type,
        advancedFilterValues?.topics,
        advancedFilterValues?.thematics,
    ]);

    const {
        data: countryCombinedIndicatorsData,
        loading: countryCombinedIndicatorsLoading,
    } = useQuery<CountryCombinedIndicatorsQuery, CountryCombinedIndicatorsQueryVariables>(
        COUNTRY_COMBINED_INDICATORS,
        {
            skip: isNotDefined(filterValues?.country),
            variables: countryCombinedVariables,
        },
    );

    const regionalCombinedVariables = useMemo((): RegionalCombinedIndicatorsQueryVariables => ({
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
        type: advancedFilterValues?.type,
        thematics: advancedFilterValues?.thematics,
        topics: advancedFilterValues?.topics,
    }), [
        filterValues?.region,
        filterValues?.outbreak,
        advancedFilterValues?.type,
        advancedFilterValues?.topics,
        advancedFilterValues?.thematics,
    ]);

    const {
        data: regionalCombinedIndicatorsData,
        loading: regionalCombinedIndicatorsLoading,
    } = useQuery<RegionalCombinedIndicatorsQuery, RegionalCombinedIndicatorsQueryVariables>(
        REGIONAL_COMBINED_INDICATORS,
        {
            skip: isDefined(filterValues?.country) || isNotDefined(filterValues?.region),
            variables: regionalCombinedVariables,
        },
    );

    const globalCombinedVariables = useMemo((): GlobalCombinedIndicatorsQueryVariables => ({
        emergency: filterValues?.outbreak,
        thematics: advancedFilterValues?.thematics,
        type: advancedFilterValues?.type,
        topics: advancedFilterValues?.topics,
    }), [
        filterValues?.outbreak,
        advancedFilterValues?.type,
        advancedFilterValues?.topics,
        advancedFilterValues?.thematics,
    ]);

    const {
        data: globalCombinedIndicatorsData,
        loading: globalCombinedIndicatorsLoading,
    } = useQuery<GlobalCombinedIndicatorsQuery, GlobalCombinedIndicatorsQueryVariables>(
        GLOBAL_COMBINED_INDICATORS,
        {
            skip: isDefined(filterValues?.country) || isDefined(filterValues?.region),
            variables: globalCombinedVariables,
        },
    );

    const selectedIndicatorsData = useMemo(() => {
        if (isDefined(filterValues?.country)) {
            return countryCombinedIndicatorsData?.countryCombinedIndicators;
        }

        if (isDefined(filterValues?.region)) {
            return regionalCombinedIndicatorsData?.regionCombinedIndicators;
        }

        return globalCombinedIndicatorsData?.globalCombinedIndicators;
    }, [
        filterValues?.country,
        filterValues?.region,
        regionalCombinedIndicatorsData?.regionCombinedIndicators,
        countryCombinedIndicatorsData?.countryCombinedIndicators,
        globalCombinedIndicatorsData?.globalCombinedIndicators,
    ]);

    const topicSeparatedIndicators = selectedIndicatorsData?.flatMap(
        (thematic) => (
            thematic.topics?.flatMap(
                (topic) => ({
                    thematicName: thematic.thematic,
                    thematicDescription: thematic.thematicDescription,
                    topicName: topic.topicName,
                    topicDescription: topic.topicDescription,
                    indicators: topic.indicators,
                }),
            )
        ),
    );

    const indicatorsWithFullDetail = topicSeparatedIndicators?.flatMap(
        (topic) => (
            topic?.indicators?.flatMap(
                (indicator) => ({
                    thematicName: topic.thematicName,
                    thematicDescription: topic.thematicDescription,
                    topicName: topic.topicName,
                    topicDescription: topic.topicDescription,
                    indicatorId: indicator.indicatorId,
                    indicatorName: indicator.indicatorName,
                    indicatorDescription: indicator.indicatorDescription,
                    subvariable: indicator.subvariable,
                }),
            )
        ),
    );

    const indicatorsWithConcatenatedString = indicatorsWithFullDetail?.map(
        (ind) => ({
            thematicName: ind?.thematicName,
            topicName: ind?.topicName,
            indicatorId: ind?.indicatorId,
            subvariableId: ind?.subvariable,
            textToSearch: Object.values(ind ?? {}).join(' '),
        }),
    );

    const [
        includedThematics,
        includedTopics,
        includedIndicators,
        includedSubvariables,
    ] = useMemo(() => {
        const indicatorItem = indicatorsWithConcatenatedString?.filter((item) => (
            (keywordSearchText?.length ?? 0) > 0
                ? caseInsensitiveSubmatch(item.textToSearch, keywordSearchText)
                : true
        ));
        return ([
            indicatorItem?.map((item) => item.thematicName).filter(isDefined),
            indicatorItem?.map((item) => item.topicName).filter(isDefined),
            indicatorItem?.map((item) => item.indicatorId ?? undefined).filter(isDefined),
            indicatorItem?.map((item) => item.subvariableId ?? undefined).filter(isDefined),
        ]);
    }, [
        indicatorsWithConcatenatedString,
        keywordSearchText,
    ]);
    const thematicRendererParams = useCallback((
        _: string,
        item: RegionalIndicatorType | CountryIndicatorType | GlobalIndicatorType,
    ) => ({
        thematicName: item.thematic,
        thematicDescription: (item.thematic !== item.thematicDescription)
            ? (item.thematicDescription ?? undefined) : undefined,
        indicators: item.topics ?? undefined,
        showRegionalValue: isDefined(filterValues?.country),
        includedTopics,
        includedIndicators,
        includedSubvariables,
        searchText: keywordSearchText,
        setFilterValues,
        filterValues,
        setActiveTab,
    }
    ), [
        filterValues,
        setFilterValues,
        setActiveTab,
        includedIndicators,
        includedTopics,
        includedSubvariables,
        keywordSearchText,
    ]);

    const thematicKeySelector = (
        d: RegionalIndicatorType | CountryIndicatorType | GlobalIndicatorType,
    ) => d.thematic;

    const loading = useMemo(() => {
        if (isDefined(filterValues?.country)) {
            return countryCombinedIndicatorsLoading;
        }

        if (isDefined(filterValues?.region)) {
            return regionalCombinedIndicatorsLoading;
        }

        return globalCombinedIndicatorsLoading;
    }, [
        filterValues,
        countryCombinedIndicatorsLoading,
        regionalCombinedIndicatorsLoading,
        globalCombinedIndicatorsLoading,
    ]);

    const filterDataEmpty = doesObjectHaveNoData(filterValues)
        && doesObjectHaveNoData(advancedFilterValues);

    const filteredIndicatorsList = useMemo(() => (
        selectedIndicatorsData?.filter(
            (indicator) => (includedThematics?.includes(indicator?.thematic)),
        )
    ), [
        selectedIndicatorsData,
        includedThematics,
    ]);

    return (
        <div className={_cs(className, styles.combinedIndicatorWrapper)}>
            <ListView
                className={_cs(
                    styles.themes,
                    (selectedIndicatorsData?.length ?? 0) === 0 && styles.empty,
                )}
                data={filteredIndicatorsList}
                renderer={ThematicRenderer}
                rendererParams={thematicRendererParams}
                keySelector={thematicKeySelector}
                emptyMessage="No indicators available"
                filteredEmptyMessage="Couldn't find data based on the current filters"
                emptyIcon={<IoFileTraySharp />}
                filteredEmptyIcon={<IoFileTraySharp />}
                pending={loading}
                errored={false}
                filtered={!filterDataEmpty}
                messageShown
                messageIconShown
            />
        </div>
    );
}

export default CombinedIndicators;
