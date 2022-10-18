import React, { useCallback, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    List,
    PendingAnimation,
} from '@the-deep/deep-ui';

import {
    CountryCombinedIndicatorsQuery,
    CountryCombinedIndicatorsQueryVariables,
    RegionalCombinedIndicatorsQuery,
    RegionalCombinedIndicatorsQueryVariables,
    GlobalCombinedIndicatorsQuery,
    GlobalCombinedIndicatorsQueryVariables,
} from '#generated/types';
import { TabTypes } from '#views/Dashboard';
import Sources from '#components/Sources';

import TopicCard from './TopicCard';
import { AdvancedOptionType } from '../AdvancedFilters';
import { FilterType } from '../Filters';
import styles from './styles.css';

const COUNTRY_COMBINED_INDICATORS = gql`
    query CountryCombinedIndicators (
        $emergency: String,
        $iso3: String,
        $topic: String
        $thematic: String
        $type: String
    ) {
        countryCombinedIndicators (filters: {
            category: "Global",
            emergency: $emergency,
            iso3: $iso3,
            topic: $topic,
            thematic: $thematic,
            type: $type,
        }) {
            thematic
            thematicDescription
            topics {
                indicators {
                    indicatorId
                    indicatorName
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

export type CountryIndicatorType = NonNullable<CountryCombinedIndicatorsQuery['countryCombinedIndicators']>[number];

const REGIONAL_COMBINED_INDICATORS = gql`
    query RegionalCombinedIndicators (
        $emergency: String,
        $region: String,
        $topic: String
        $thematic: String
        $type: String
    ) {
        regionCombinedIndicators (filters: {
            category: "Global",
            emergency: $emergency,
            region: $region,
            topic: $topic,
            thematic: $thematic,
            type: $type,
        }) {
            thematic
            thematicDescription
            topics {
                indicators {
                    indicatorId
                    indicatorName
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
        $thematic: String,
        $topic: String,
    ) {
        globalCombinedIndicators(filters: {
            category: "Global",
            topic: $topic,
            thematic: $thematic,
            type: $type,
            emergency: $emergency,
        }) {
            thematic
            thematicDescription
            topics {
                indicators {
                    indicatorId
                    indicatorName
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

export type GlobalIndicatorType = NonNullable<GlobalCombinedIndicatorsQuery['globalCombinedIndicators']>[number];

export type TopicIndicatorType = NonNullable<
    | GlobalIndicatorType['topics']
    | CountryIndicatorType['topics']
    | RegionalIndicatorType['topics']
>[number];

export type IndicatorType = NonNullable<TopicIndicatorType['indicators']>[number];

interface ThematicProps {
    thematicName: string;
    thematicDescription: string;
    indicators: TopicIndicatorType[] | undefined;
    showRegionalValue: boolean;
    filterValues: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
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
    } = props;

    const topicKeySelector = (d: TopicIndicatorType) => d.topicName;

    const topicRendererParams = useCallback((_: string, data: TopicIndicatorType) => ({
        topicName: data.topicName,
        topicDescription: data.topicDescription ?? '',
        indicators: data.indicators ?? undefined,
        showRegionalValue,
        filterValues,
        setFilterValues,
        setActiveTab,
    }), [
        showRegionalValue,
        setActiveTab,
        filterValues,
        setFilterValues,
    ]);

    return (
        <div
            className={styles.thematicContainer}
        >
            <ContainerCard
                className={styles.thematicHeader}
                heading={thematicName}
                headerDescription={thematicDescription}
            />
            <List
                data={indicators}
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
}

function CombinedIndicators(props: Props) {
    const {
        className,
        filterValues,
        advancedFilterValues,
        setFilterValues,
        setActiveTab,
    } = props;

    const {
        data: countryCombinedIndicatorsData,
        loading: countryCombinedIndicatorsLoading,
    } = useQuery<CountryCombinedIndicatorsQuery, CountryCombinedIndicatorsQueryVariables>(
        COUNTRY_COMBINED_INDICATORS,
        {
            skip: isNotDefined(filterValues?.country),
            variables: {
                iso3: filterValues?.country,
                emergency: filterValues?.outbreak,
                type: advancedFilterValues?.type,
                thematic: advancedFilterValues?.thematic,
                topic: advancedFilterValues?.topic,
            },
        },
    );

    const {
        data: regionalCombinedIndicatorsData,
        loading: regionalCombinedIndicatorsLoading,
    } = useQuery<RegionalCombinedIndicatorsQuery, RegionalCombinedIndicatorsQueryVariables>(
        REGIONAL_COMBINED_INDICATORS,
        {
            skip: isDefined(filterValues?.country) || isNotDefined(filterValues?.region),
            variables: {
                emergency: filterValues?.outbreak,
                region: filterValues?.region,
                type: advancedFilterValues?.type,
                thematic: advancedFilterValues?.thematic,
                topic: advancedFilterValues?.topic,
            },
        },
    );

    const {
        data: globalCombinedIndicatorsData,
        loading: globalCombinedIndicatorsLoading,
    } = useQuery<GlobalCombinedIndicatorsQuery, GlobalCombinedIndicatorsQueryVariables>(
        GLOBAL_COMBINED_INDICATORS,
        {
            skip: isDefined(filterValues?.country) || isDefined(filterValues?.region),
            variables: {
                emergency: filterValues?.outbreak,
                thematic: advancedFilterValues?.thematic,
                type: advancedFilterValues?.type,
                topic: advancedFilterValues?.topic,
            },
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

    const thematicRendererParams = useCallback(
        (
            _: string,
            item: RegionalIndicatorType | CountryIndicatorType | GlobalIndicatorType,
        ) => ({
            thematicName: item.thematic,
            thematicDescription: item.thematicDescription ?? '',
            indicators: item.topics ?? undefined,
            showRegionalValue: isDefined(filterValues?.country),
            setFilterValues,
            filterValues,
            setActiveTab,
        }
        ), [
            filterValues,
            setFilterValues,
            setActiveTab,
        ],
    );
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

    return (
        <div className={_cs(className, styles.combinedIndicatorWrapper)}>
            {loading && <PendingAnimation />}
            <List
                data={selectedIndicatorsData}
                renderer={ThematicRenderer}
                rendererParams={thematicRendererParams}
                keySelector={thematicKeySelector}
            />
            <Sources
                title="title"
                sourceComment="comment"
            />
        </div>
    );
}

export default CombinedIndicators;
