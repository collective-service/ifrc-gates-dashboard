import React, { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { isNotDefined, _cs } from '@togglecorp/fujs';
import { Message } from '@the-deep/deep-ui';
import { IoFileTraySharp } from 'react-icons/io5';

import styles from './styles.css';

interface DataProps {
    [key: string]: string | number | null | undefined;
}

interface Props {
    children: ReactElement;
    className?: string;
    loading?: boolean;
    data?: DataProps[];
}

function ChartContainer(props: Props) {
    const {
        children,
        className,
        loading,
        data,
        ...otherProps
    } = props;
    const empty = isNotDefined(data) || (data.length < 1);

    if (empty) {
        return (
            <ResponsiveContainer
                className={_cs(className)}
                {...otherProps}
            >
                <Message
                    className={styles.message}
                    empty={empty}
                    emptyIcon={<IoFileTraySharp />}
                    pending={loading}
                    pendingContainerClassName={styles.pendingMessage}
                />
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer
            className={_cs(className)}
            {...otherProps}
        >
            {children}
        </ResponsiveContainer>
    );
}

export default ChartContainer;
