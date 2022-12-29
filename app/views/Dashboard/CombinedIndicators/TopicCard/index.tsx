import React, { useCallback, useMemo } from 'react';
import Highlighter from 'react-highlight-words';
import {
    isDefined,
    listToGroupList,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    List,
} from '@the-deep/deep-ui';

import { FilterType } from '#views/Dashboard/Filters';
import { TabTypes } from '#views/Dashboard';

import OutbreakIndicators from './OutbreakIndicators';
import { IndicatorType } from '..';

import styles from './styles.css';

const subvariableKeySelector = (d: { emergency: string }) => d.emergency;

interface Props {
    topicName: string;
    topicDescription: string | undefined;
    indicators: IndicatorType[] | undefined;
    showRegionalValue: boolean;
    filterValues: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    includedIndicators: string[] | undefined;
    includedSubvariables: string[] | undefined;
    searchText: string | undefined;
}

function TopicCard(props: Props) {
    const {
        topicName,
        topicDescription,
        indicators,
        showRegionalValue,
        filterValues,
        setFilterValues,
        setActiveTab,
        includedIndicators,
        includedSubvariables,
        searchText,
    } = props;

    const handleIndicatorClick = useCallback((
        indicatorId?: string,
        subVariable?: string,
        emergency?: string,
    ) => {
        if (isDefined(filterValues?.country)) {
            setActiveTab('country');

            if (isDefined(indicatorId)) {
                setFilterValues((old) => ({
                    ...old,
                    indicator: indicatorId,
                    subvariable: subVariable,
                    outbreak: emergency,
                }));
            }
        } else {
            setActiveTab('overview');

            if (isDefined(indicatorId)) {
                setFilterValues((old) => ({
                    ...old,
                    indicator: indicatorId,
                    subvariable: subVariable,
                    outbreak: emergency,
                }));
            }
        }
    }, [
        filterValues,
        setActiveTab,
        setFilterValues,
    ]);

    const groupedIndicatorsRendererParams = useCallback((
        emergency: string,
        data: { emergency: string; list: IndicatorType[] },
    ) => ({
        list: data.list,
        emergency,
        country: filterValues?.country,
        showRegionalValue,
        includedIndicators,
        includedSubvariables,
        handleIndicatorClick,
        searchText,
    }), [
        filterValues,
        showRegionalValue,
        handleIndicatorClick,
        includedIndicators,
        includedSubvariables,
        searchText,
    ]);

    const groupedList = useMemo(() => (
        Object.values(listToGroupList(
            indicators,
            (indicator) => indicator.emergency,
        ) ?? {}).map((list) => ({
            emergency: list[0].emergency,
            list,
        }))
    ), [
        indicators,
    ]);

    return (
        <ContainerCard
            className={styles.topicCard}
            heading={(
                <Highlighter
                    searchWords={[searchText ?? '']}
                    autoEscape
                    textToHighlight={topicName}
                />
            )}
            headingSize="small"
            spacing="loose"
            headingContainerClassName={styles.heading}
            headingDescriptionClassName={styles.topicDescription}
            headingDescription={(
                <Highlighter
                    searchWords={[searchText ?? '']}
                    autoEscape
                    textToHighlight={topicDescription ?? ''}
                />
            )}
            contentClassName={styles.emergencies}
            borderBelowHeader
            borderBelowHeaderWidth="thin"
        >
            <List
                keySelector={subvariableKeySelector}
                data={groupedList}
                rendererParams={groupedIndicatorsRendererParams}
                renderer={OutbreakIndicators}
            />
        </ContainerCard>
    );
}

export default TopicCard;
