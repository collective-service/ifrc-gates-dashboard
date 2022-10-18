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
import { FormatType } from '#utils/common';

import { IndicatorType } from '..';

import styles from './styles.css';

const barHeight = 8;

const indicatorKeySelector = (d: IndicatorType) => d.subvariable ?? '';

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

    const indicatorRendererParams = useCallback((_: string, data: IndicatorType) => ({
        className: styles.indicatorItem,
        barHeight,
        barName: `${data.indicatorName} - ${data.subvariable}`,
        title: data.indicatorDescription ?? undefined,
        valueTitle: data.indicatorName ?? undefined,
        value: data.indicatorValue ?? undefined,
        subValue: data.indicatorValueRegional ?? undefined,
        totalValue: 1,
        indicatorId: data.indicatorId ?? undefined,
        subVariable: data.subvariable ?? undefined,
        icon: <IoInformationCircleOutline />,
        color: '#98a6b5',
        region: data.region ?? undefined,
        showRegionalValue,
        onTitleClick: handleIndicatorClick,
        format: (data.format ?? 'raw') as FormatType,
    }), [
        showRegionalValue,
        handleIndicatorClick,
    ]);

    return (
        <ContainerCard
            className={styles.topicCard}
            contentClassName={styles.topicContainer}
            heading={topicName}
            headingSize="small"
            headerDescription={topicDescription}
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
