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

const barHeight = 6;

const progressDataOne = [
    {
        countryName: 'Cameroon',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 130,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Algeria',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 50,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Bulgaria',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 99.5,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Democratic Republic of Congo',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 105,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Belarus',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 125,
                totalValue: 200,
            },
        ],
    },
];

const progressDataTwo = [
    {
        countryName: 'Oman',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 180,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Malaysia',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 190,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Viet Nam',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 195,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Bangladesh',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 175,
                totalValue: 200,
            },
        ],
    },
    {
        countryName: 'Lao PDR',
        progressData: [
            {
                title: 'Signed Off',
                color: 'var(--color-success)',
                value: 156,
                totalValue: 200,
            },
        ],
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
                    className={styles.lowProgressRate}
                    contentClassName={styles.progressRateBox}
                    heading="Lowest cases"
                    headingSize="extraSmall"
                >
                    {progressDataOne.map((item) => (
                        <>
                            {item.countryName}
                            <ProgressBar
                                barHeight={barHeight}
                                data={item.progressData}
                            />
                        </>
                    ))}
                </ContainerCard>
                <ContainerCard
                    className={styles.highProgressRate}
                    contentClassName={styles.progressRateBox}
                    heading="Highest cases"
                    headingSize="extraSmall"
                >
                    {progressDataTwo.map((item) => (
                        <>
                            {item.countryName}
                            <ProgressBar
                                barHeight={barHeight}
                                data={item.progressData}
                            />
                        </>
                    ))}
                </ContainerCard>
            </div>
        </div>
    );
}
export default MapView;
