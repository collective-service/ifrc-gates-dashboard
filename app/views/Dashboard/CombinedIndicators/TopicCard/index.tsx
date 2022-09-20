import React, { useCallback } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';

import {
    ContainerCard,
    List,
} from '@the-deep/deep-ui';

import ProgressBar from '#components/ProgressBar';

import { IndicatorDataType } from '..';

import styles from './styles.css';

const barHeight = 8;

interface Props {
    indicatorKey: string;
    indicators: IndicatorDataType[];
    showRegionalValue: boolean;
}

function TopicCard(props: Props) {
    const {
        indicatorKey,
        indicators,
        showRegionalValue,
    } = props;

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
        id: +`${data.indicatorId}-${data.subvariable}`,
        icon: <IoInformationCircleOutline />,
        color: '#98a6b5',
        region: data.region ?? '',
        showRegionalValue,
    }), [showRegionalValue]);

    const indicatorKeySelector = (d: IndicatorDataType) => d.subvariable;

    return (
        <ContainerCard
            className={styles.topicCard}
            contentClassName={styles.topicContainer}
            heading={indicatorKey}
            headingSize="small"
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
