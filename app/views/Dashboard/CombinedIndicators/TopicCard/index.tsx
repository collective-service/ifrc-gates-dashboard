import React, { useCallback, useMemo } from 'react';
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
    topicDescription?: string;
    indicators: IndicatorType[] | undefined;
    showRegionalValue: boolean;
    filterValues: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
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
        showRegionalValue,
        handleIndicatorClick,
    }), [
        showRegionalValue,
        handleIndicatorClick,
    ]);

    const groupedList = useMemo(() => (
        Object.values(listToGroupList(
            indicators,
            (indicator) => indicator.emergency,
        ) ?? {}).map((list) => ({
            emergency: list[0].emergency,
            list,
        }))
    ), [indicators]);

    return (
        <ContainerCard
            className={styles.topicCard}
            heading={topicName}
            headingSize="small"
            spacing="loose"
            headingContainerClassName={styles.heading}
            headingDescriptionClassName={styles.topicDescription}
            headingDescription={topicDescription}
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
