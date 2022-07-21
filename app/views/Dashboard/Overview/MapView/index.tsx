import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import ProgressBar from '#components/ProgressBar';

import styles from './styles.css';

interface MapViewProps {
    className?: string;
}

const barHeight = 10;

const progressDataOne = [
    {
        title: 'Signed Off',
        color: 'var(--color-success)',
        value: 20,
    },
    {
        title: 'Review Completed',
        color: 'var(--color-success)',
        value: 50,
    },
    {
        title: 'Under Review',
        color: 'var(--color-success)',
        value: 30,
    },
    {
        title: 'To be Reviewed',
        color: 'var(--color-success)',
        value: 10,
    },
];

const progressDataTwo = [
    {
        title: 'Signed Off',
        color: 'var(--color-success)',
        value: 99.1,
    },
    {
        title: 'Review Completed',
        color: 'var(--color-success',
        value: 98,
    },
    {
        title: 'Under Review',
        color: 'var(--color-success)',
        value: 97.5,
    },
    {
        title: 'To be Reviewed',
        color: 'var(--color-success',
        value: 96,
    },
];

function MapView(props: MapViewProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.mapViewWrapper)}>
            <ContainerCard className={styles.mapContainer}>
                ---------------------------------
                ----The actual map will stay here----
                ---------------------------------
                ---------------------------------
                ---------------------------------
                ---------------------------------
                ---------------------------------
                ---------------------------------
                ---------------------------------
                ---------------------------------
                ---------------------------------
                ---------------------------------
            </ContainerCard>
            <div className={styles.progressBarContainer}>
                <ContainerCard
                    className={styles.progressRate}
                    heading="Lowest rates"
                    headingSize="extraSmall"
                >
                    country-name
                    <ProgressBar
                        barHeight={barHeight}
                        data={progressDataOne}
                    />
                </ContainerCard>
                <ContainerCard
                    className={styles.progressRate}
                    heading="Highest rates"
                    headingSize="extraSmall"
                >
                    country-name
                    <ProgressBar
                        barHeight={barHeight}
                        data={progressDataTwo}
                    />
                </ContainerCard>
            </div>
        </div>
    );
}
export default MapView;
