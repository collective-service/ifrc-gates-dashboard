import React from 'react';
import {
    isDefined,
    _cs,
} from '@togglecorp/fujs';
import {
    TextOutput,
    Tooltip,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props{
    label: string;
    value: string | undefined;
    source?: string;
    date?: string;
    showRegionalValue?: boolean;
    region?: string;
    regionalValue?: string;
    className?: string;
}

function CountryStatItem(props: Props) {
    const {
        label,
        value,
        source,
        date,
        region,
        regionalValue,
        showRegionalValue = false,
        className,
    } = props;

    if (!isDefined(value)) {
        return null;
    }
    return (
        <div className={styles.statItemContainer}>
            <TextOutput
                className={_cs(styles.statItem, className)}
                valueContainerClassName={styles.valueText}
                labelContainerClassName={styles.labelText}
                hideLabelColon
                label={label}
                value={(
                    <>
                        {value}
                        {showRegionalValue && (
                            <TextOutput
                                labelContainerClassName={styles.regionalText}
                                valueContainerClassName={styles.regionalText}
                                label={region}
                                value={regionalValue}
                            />
                        )}
                    </>
                )}
            />
            {(source || date) && (
                <Tooltip trackMousePosition>
                    {source && `${source}`}
                    {source && date && ' - '}
                    {date && `${date}`}
                </Tooltip>
            )}
        </div>
    );
}

export default CountryStatItem;
