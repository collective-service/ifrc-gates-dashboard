import React, { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { isNotDefined } from '@togglecorp/fujs';
import { Message } from '@the-deep/deep-ui';
import { IoFileTraySharp } from 'react-icons/io5';

import styles from './styles.css';

interface Props<T> {
    children: ReactElement;
    className?: string;
    loading?: boolean;
    hasFilteredData?: boolean;
    data?: T[];
}

function ChartContainer<T>(props: Props<T>) {
    const {
        children,
        className,
        loading,
        data,
        hasFilteredData = true,
        ...otherProps
    } = props;
    const empty = isNotDefined(data) || (data.length < 1);

    if (empty || loading || !hasFilteredData) {
        return (
            <ResponsiveContainer
                className={className}
                {...otherProps}
            >
                <Message
                    className={styles.message}
                    empty={empty || !hasFilteredData}
                    emptyIcon={<IoFileTraySharp />}
                    pending={loading}
                    pendingContainerClassName={styles.pendingMessage}
                />
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer
            className={className}
            {...otherProps}
        >
            {children}
        </ResponsiveContainer>
    );
}

export default ChartContainer;
