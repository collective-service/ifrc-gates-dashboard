import React, { useCallback, useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    ListView,
    Header,
} from '@the-deep/deep-ui';

import { FormatType } from '#utils/common';

import ModifiedProgressBar, { Props as ModifiedProgressBarProps } from './ModifiedProgressBar';
import { IndicatorType } from '../..';

import styles from './styles.css';

const indicatorKeySelector = (d: IndicatorType) => `${d.indicatorId}-${d.subvariable}` ?? '';

interface Props {
    className?: string;
    list: IndicatorType[];
    showRegionalValue: boolean;
    emergency: string;
    handleIndicatorClick: (indicatorId?: string, subVariable?: string, emergency?: string) => void;
    country?: string;
    includedIndicators?: string[] | undefined;
    includedSubvariables?: string[] | undefined;
    searchText: string | undefined;
}

function OutbreakIndicators(props: Props) {
    const {
        className,
        list,
        showRegionalValue,
        emergency,
        country,
        handleIndicatorClick,
        includedIndicators,
        includedSubvariables,
        searchText,
    } = props;

    const filteredIndicatorsList = useMemo(() => (
        list.filter(
            (indicator) => (
                indicator.indicatorId
                && indicator.subvariable
                && includedIndicators?.includes(indicator?.indicatorId ?? undefined)
                && includedSubvariables?.includes(indicator?.subvariable ?? undefined)
            ),
        )
    ), [
        includedIndicators,
        includedSubvariables,
        list,
    ]);

    const indicatorRendererParams = useCallback(
        (_: string, data: IndicatorType): ModifiedProgressBarProps => ({
            className: styles.progressBar,
            indicatorName: data.indicatorName,
            subvariableName: data.subvariable ?? undefined,
            indicatorMonth: data.indicatorMonth ?? undefined,
            title: data.indicatorDescription ?? undefined,
            country,
            valueTitle: data.indicatorName ?? undefined,
            value: data.indicatorValue ?? undefined,
            totalValue: 1,
            indicatorId: data.indicatorId ?? undefined,
            subVariable: data.subvariable ?? undefined,
            color: '#98a6b5',
            emergency,
            region: data.region ?? undefined,
            indicatorValueRegional: data.indicatorValueRegional ?? undefined,
            showRegionalValue,
            onTitleClick: handleIndicatorClick,
            format: (data.format ?? 'raw') as FormatType,
            searchText,
        }), [
            showRegionalValue,
            emergency,
            handleIndicatorClick,
            country,
            searchText,
        ],
    );

    return (
        <div className={_cs(className, styles.subIndicatorItem)}>
            <Header
                headingClassName={styles.heading}
                heading={emergency}
                headingSize="extraSmall"
            />
            <ListView
                className={styles.indicatorList}
                keySelector={indicatorKeySelector}
                data={filteredIndicatorsList}
                rendererParams={indicatorRendererParams}
                renderer={ModifiedProgressBar}
                pending={false}
                errored={false}
                filtered={false}
            />
        </div>
    );
}

export default OutbreakIndicators;
