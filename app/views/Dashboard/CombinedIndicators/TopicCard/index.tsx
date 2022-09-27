import React, { useCallback } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import {
    isDefined,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    List,
} from '@the-deep/deep-ui';

import ProgressBar from '#components/ProgressBar';
import { FilterType } from '#views/Dashboard/Filters';
import { TabTypes } from '#views/Dashboard';

import { IndicatorDataType } from '..';

import styles from './styles.css';

const barHeight = 8;

interface Props {
    indicatorKey: string;
    indicators: IndicatorDataType[];
    showRegionalValue: boolean;
    filterValues: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
}

function TopicCard(props: Props) {
    const {
        indicatorKey,
        indicators,
        showRegionalValue,
        filterValues,
        setFilterValues,
        setActiveTab,
    } = props;

    const handleIndicatorClick = useCallback((indicatorId?: string, subVariable?: string) => {
        if (isDefined(filterValues?.country)) {
            setActiveTab('country');

            if (isDefined(indicatorId)) {
                setFilterValues((old) => ({
                    ...old,
                    indicator: indicatorId,
                    subvariable: subVariable,
                }));
            }
        } else {
            setActiveTab('overview');

            if (isDefined(indicatorId)) {
                setFilterValues((old) => ({
                    ...old,
                    indicator: indicatorId,
                }));
            }
        }
    }, [
        filterValues,
        setActiveTab,
        setFilterValues,
    ]);

    const indicatorRendererParams = useCallback((_: string, data: IndicatorDataType) => ({
        className: styles.indicatorItem,
        barHeight,
        suffix: '%',
        barName: `${data.indicatorName} - ${data.subvariable}`,
        title: data.indicatorDescription ?? ' ',
        valueTitle: data.indicatorName ?? '',
        value: data.indicatorValue ?? 0,
        subValue: data.indicatorValueRegional ?? 0,
        totalValue: 1,
        indicatorId: data.indicatorId,
        subVariable: data.indicatorId,
        icon: <IoInformationCircleOutline />,
        color: '#98a6b5',
        region: data.region ?? '',
        showRegionalValue,
        onTitleClick: handleIndicatorClick,
    }), [
        showRegionalValue,
        handleIndicatorClick,
    ]);

    const indicatorKeySelector = (d: IndicatorDataType) => d.subvariable;

    return (
        <ContainerCard
            className={styles.topicCard}
            contentClassName={styles.topicContainer}
            heading={indicatorKey}
            headingSize="small"
            headerDescription={indicators[0]?.topicDescription}
            spacing="loose"
        >
            <List
                keySelector={indicatorKeySelector}
                data={indicators}
                rendererParams={indicatorRendererParams}
                renderer={ProgressBar}
            />
        </ContainerCard>
    );
}

export default TopicCard;
