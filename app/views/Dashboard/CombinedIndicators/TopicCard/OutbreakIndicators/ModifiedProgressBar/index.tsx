import React, { useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Button } from '@the-deep/deep-ui';

import ProgressBar, { Props as ProgressBarProps } from '#components/ProgressBar';
import {
    formatNumber,
} from '#utils/common';

import styles from './styles.css';

export interface Props extends Omit<ProgressBarProps, 'barName' | 'barHeight'> {
    indicatorName?: string;
    emergency?: string;
    subvariableName?: string;
    indicatorId?: string;
    subVariable?: string;
    onTitleClick?: (indicatorId?: string, subVariable?: string, emergency?: string) => void;
    showRegionalValue: boolean;
    indicatorValueRegional?: number | null | undefined;
    region?: string | undefined;
}

function ModifiedProgressBar(props: Props) {
    const {
        className,
        indicatorName,
        subvariableName,
        indicatorId,
        subVariable,
        onTitleClick,
        emergency,
        region,
        format,
        showRegionalValue,
        indicatorValueRegional,
        ...otherProps
    } = props;

    const subValuePercentage = useMemo(() => (
        `${region}: ${formatNumber(format ?? 'raw', indicatorValueRegional ?? 0)}`
    ), [
        format,
        indicatorValueRegional,
        region,
    ]);

    const handleTitleClick = useCallback(() => {
        if (!onTitleClick) {
            return;
        }
        onTitleClick(indicatorId, subVariable, emergency);
    }, [
        onTitleClick,
        emergency,
        indicatorId,
        subVariable,
    ]);

    return (
        <ProgressBar
            className={_cs(styles.modifiedProgressBar, className)}
            barName={(
                <Button
                    className={styles.barName}
                    childrenContainerClassName={styles.children}
                    name={undefined}
                    onClick={handleTitleClick}
                    variant="transparent"
                >
                    <div className={styles.indicatorName}>
                        {indicatorName}
                    </div>
                    <div className={styles.separator}>{'>'}</div>
                    <div className={styles.subvariableName}>
                        {subvariableName}
                    </div>
                </Button>
            )}
            format={format}
            barHeight={8}
            footer={showRegionalValue && subValuePercentage && (
                <div className={styles.subValue}>
                    {subValuePercentage}
                </div>
            )}
            {...otherProps}
        />
    );
}

export default ModifiedProgressBar;
