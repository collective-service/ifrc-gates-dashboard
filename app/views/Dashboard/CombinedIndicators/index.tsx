import React, { useCallback, useMemo } from 'react';

import { gql, useQuery } from '@apollo/client';
import {
    listToGroupList,
    _cs,
    mapToList,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    List,
    PendingAnimation,
} from '@the-deep/deep-ui';

import {
    CombinedIndicatorsDataQuery,
    CombinedIndicatorsDataQueryVariables,
} from '#generated/types';

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
        $keywords: [String!]
    ) {
        dataCountryLevelMostRecent(
            filters: {
                iso3: $iso3,
                emergency: $emergency,
                type: $type,
                thematic: $thematic,
                topic: $topic,
                keywords: $keywords,
            }
        ) {
            emergency
            iso3
            region
            indicatorName
            indicatorDescription
            indicatorValue
            indicatorValueGradient
            type
            thematic
            topic
            subvariable
            indicatorId
        }
    }
`;

export type IndicatorDataType = NonNullable<CombinedIndicatorsDataQuery['dataCountryLevelMostRecent']>[number];

interface SeparatedThematic {
    key: string;
    items: IndicatorDataType[];
}

interface ThematicProps {
    thematicName: string;
    indicators: IndicatorDataType[];
}

function ThematicRenderer(props: ThematicProps) {
    const {
        thematicName,
        indicators,
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
    }), []);

    return (
        <div
            className={styles.thematicContainer}
        >
            <ContainerCard
                className={styles.thematicHeader}
                heading={thematicName}
            >
                The description of the thematic goes here.
            </ContainerCard>
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
}

function CombinedIndicators(props: Props) {
    const {
        className,
        filterValues,
        advancedFilterValues,
    } = props;

    const combinedIndicatorVariables = useMemo(() => ({
        iso3: filterValues?.country ?? 'AFG',
        emergency: filterValues?.outbreak,
        type: advancedFilterValues?.type,
        thematic: advancedFilterValues?.thematic,
        topic: advancedFilterValues?.topic,
        keywords: advancedFilterValues?.keywords,
    }), [
        filterValues,
        advancedFilterValues,
    ]);

    const {
        data: combinedIndicatorsData,
        loading: combinedIndicatorsLoading,
    } = useQuery<CombinedIndicatorsDataQuery, CombinedIndicatorsDataQueryVariables>(
        COMBINED_INDICATORS_DATA,
        {
            variables: combinedIndicatorVariables,
        },
    );

    const thematicSeparatedIndicators = useMemo(() => {
        const thematicGroupedList = listToGroupList(
            combinedIndicatorsData?.dataCountryLevelMostRecent,
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
    }, [combinedIndicatorsData?.dataCountryLevelMostRecent]);

    const thematicRendererParams = useCallback((_: string, item: SeparatedThematic) => ({
        thematicName: item.key,
        indicators: item.items,
    }), []);

    const topicKeySelector = (d: SeparatedThematic) => d.key;

    return (
        <div className={_cs(className, styles.combinedIndicatorWrapper)}>
            {combinedIndicatorsLoading && <PendingAnimation />}
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
