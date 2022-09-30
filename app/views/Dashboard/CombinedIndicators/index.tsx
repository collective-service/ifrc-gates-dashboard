import React, { useCallback, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
    listToGroupList,
    _cs,
    mapToList,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    List,
    PendingAnimation,
} from '@the-deep/deep-ui';

import {
    CombinedIndicatorsDataQuery,
    CombinedIndicatorsDataQueryVariables,
    CombinedIndicatorsRegionalQuery,
    CombinedIndicatorsRegionalQueryVariables,
    CombinedIndicatorsGlobalQuery,
    CombinedIndicatorsGlobalQueryVariables,
} from '#generated/types';
import { TabTypes } from '#views/Dashboard';

import TopicCard from './TopicCard';
import { AdvancedOptionType } from '../AdvancedFilters';
import { FilterType } from '../Filters';
import styles from './styles.css';

const COMBINED_INDICATORS_DATA = gql`
    query CombinedIndicatorsData (
        $iso3: String,
        $emergency: String,
        $topic: String,
        $thematic: String,
        $type: String,
        $keywords: [String!],
    ) {
        dataCountryLevelMostRecent(
            filters: {
                iso3: $iso3,
                emergency: $emergency,
                type: $type,
                thematic: $thematic,
                topic: $topic,
                keywords: $keywords,
                category: "Global",
            }
        ) {
            emergency
            iso3
            region
            indicatorName
            indicatorDescription
            indicatorValue
            indicatorValueRegional
            type
            thematic
            thematicDescription
            topic
            topicDescription
            subvariable
            indicatorId
            format
        }
    }
`;

export type IndicatorDataType = NonNullable<CombinedIndicatorsDataQuery['dataCountryLevelMostRecent']>[number];

const COMBINED_INDICATORS_REGIONAL = gql`
    query CombinedIndicatorsRegional (
        $region: String,
        $emergency: String,
        $type: String,
        $thematic: String,
        $topic: String,
        $isCombinedIndicators: Boolean,
    ) {
        regionLevel(
            filters: {
                emergency: $emergency,
                region: $region,
                type: $type,
                thematic: $thematic,
                topic: $topic,
                isCombinedIndicators: $isCombinedIndicators,
                category: "Global"
            }
        ) {
            emergency
            region
            indicatorId
            indicatorName
            indicatorDescription
            indicatorValueRegional
            type
            thematic
            thematicDescription
            topic
            topicDescription
            subvariable
            format
        }
    }
`;

export type RegionalIndicatorType = NonNullable<CombinedIndicatorsRegionalQuery['regionLevel']>[number];

const COMBINED_INDICATORS_GLOBAL = gql`
    query CombinedIndicatorsGlobal (
        $emergency: String,
        $type: String,
        $thematic: String,
        $topic: String,
        $isCombinedIndicators: Boolean,
    ) {
        globalLevel (
            filters: {
                emergency: $emergency,
                type: $type,
                thematic: $thematic,
                topic: $topic,
                isCombinedIndicators: $isCombinedIndicators,
                category: "Global",
            }
        ) {
            emergency
            indicatorId
            indicatorName
            indicatorDescription
            indicatorValueGlobal
            region
            type
            thematic
            thematicDescription
            topic
            topicDescription
            subvariable
            format
        }
    }
`;

interface SeparatedThematic {
    key: string;
    items: IndicatorDataType[];
}

interface ThematicProps {
    thematicName: string;
    indicators: IndicatorDataType[];
    showRegionalValue: boolean;
    filterValues: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
}

function ThematicRenderer(props: ThematicProps) {
    const {
        thematicName,
        indicators,
        showRegionalValue,
        filterValues,
        setFilterValues,
        setActiveTab,
    } = props;

    const topicKeySelector = (d: SeparatedThematic) => d.key;

    const topicSeparatedIndicators = useMemo(() => {
        const topicGroupedList = listToGroupList(
            indicators,
            (data) => data?.topic ?? '',
        );
        const topicSeparatedIndicatorList = mapToList(
            topicGroupedList,
            (items, key) => ({
                key,
                items,
            }),
        );
        return topicSeparatedIndicatorList;
    }, [indicators]);

    const topicRendererParams = useCallback((key: string, data: SeparatedThematic) => ({
        indicatorKey: key,
        indicators: data.items,
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
                headerDescription={indicators[0]?.thematicDescription}
            />
            <List
                data={topicSeparatedIndicators}
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
        data: combinedIndicatorsData,
        loading: combinedIndicatorsLoading,
    } = useQuery<CombinedIndicatorsDataQuery, CombinedIndicatorsDataQueryVariables>(
        COMBINED_INDICATORS_DATA,
        {
            skip: isNotDefined(filterValues?.country),
            variables: {
                iso3: filterValues?.country,
                emergency: filterValues?.outbreak,
                type: advancedFilterValues?.type,
                thematic: advancedFilterValues?.thematic,
                topic: advancedFilterValues?.topic,
                keywords: advancedFilterValues?.keywords,
            },
        },
    );

    const {
        data: regionalCombinedIndicatorsData,
        loading: regionalCombinedIndicatorsLoading,
    } = useQuery<CombinedIndicatorsRegionalQuery, CombinedIndicatorsRegionalQueryVariables>(
        COMBINED_INDICATORS_REGIONAL,
        {
            skip: isDefined(filterValues?.country) || isNotDefined(filterValues?.region),
            variables: {
                isCombinedIndicators: true,
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
    } = useQuery<CombinedIndicatorsGlobalQuery, CombinedIndicatorsGlobalQueryVariables>(
        COMBINED_INDICATORS_GLOBAL,
        {
            skip: isDefined(filterValues?.country) || isDefined(filterValues?.region),
            variables: {
                isCombinedIndicators: true,
                emergency: filterValues?.outbreak,
                thematic: advancedFilterValues?.thematic,
                type: advancedFilterValues?.type,
                topic: advancedFilterValues?.topic,
            },
        },
    );

    const selectedIndicatorsData = useMemo(() => {
        if (isDefined(filterValues?.country)) {
            return combinedIndicatorsData?.dataCountryLevelMostRecent;
        }

        if (isDefined(filterValues?.region)) {
            return regionalCombinedIndicatorsData?.regionLevel.map((regional) => ({
                ...regional,
                iso3: '',
                indicatorValueGlobal: 0,
                indicatorValueRegional: 0,
                indicatorValue: regional.indicatorValueRegional,
            }));
        }

        return globalCombinedIndicatorsData?.globalLevel.map((global) => ({
            ...global,
            iso3: '',
            indicatorValueRegional: 0,
            indicatorValueGlobal: 0,
            indicatorValue: global.indicatorValueGlobal,
        }));
    }, [
        filterValues?.country,
        filterValues?.region,
        regionalCombinedIndicatorsData?.regionLevel,
        combinedIndicatorsData?.dataCountryLevelMostRecent,
        globalCombinedIndicatorsData?.globalLevel,
    ]);

    const thematicSeparatedIndicators = useMemo(() => {
        const thematicGroupedList = listToGroupList(
            selectedIndicatorsData,
            (data) => data?.thematic ?? '',
        );
        const thematicSeparatedIndicatorList = mapToList(
            thematicGroupedList,
            (items, key) => ({
                key,
                items,
            }),
        );
        return thematicSeparatedIndicatorList;
    }, [selectedIndicatorsData]);

    const thematicRendererParams = useCallback((_: string, item: SeparatedThematic) => ({
        thematicName: item.key,
        indicators: item.items,
        showRegionalValue: isDefined(filterValues?.country),
        setFilterValues,
        filterValues,
        setActiveTab,
    }), [
        filterValues,
        setFilterValues,
        setActiveTab,
    ]);
    const topicKeySelector = (d: SeparatedThematic) => d.key;

    const loading = useMemo(() => {
        if (isDefined(filterValues?.country)) {
            return combinedIndicatorsLoading;
        }

        if (isDefined(filterValues?.region)) {
            return regionalCombinedIndicatorsLoading;
        }

        return globalCombinedIndicatorsLoading;
    }, [
        filterValues,
        combinedIndicatorsLoading,
        regionalCombinedIndicatorsLoading,
        globalCombinedIndicatorsLoading,
    ]);

    return (
        <div className={_cs(className, styles.combinedIndicatorWrapper)}>
            {loading && <PendingAnimation />}
            <List
                data={thematicSeparatedIndicators}
                renderer={ThematicRenderer}
                rendererParams={thematicRendererParams}
                keySelector={topicKeySelector}
            />
            <ContainerCard
                className={styles.perceptionWrapper}
                contentClassName={styles.perceptionCard}
                heading="Sources"
                headingSize="extraSmall"
            >
                <p>COVID-19 Vaccine Perceptions in Africa</p>
            </ContainerCard>
        </div>
    );
}

export default CombinedIndicators;
