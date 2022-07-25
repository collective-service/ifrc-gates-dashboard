import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
} from '@the-deep/deep-ui';
import Map, {
    MapContainer,
    MapBounds,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import ProgressBar from '#components/ProgressBar';

import styles from './styles.css';

interface MapViewProps {
    className?: string;
}

const lightStyle = 'mapbox://styles/priyesh777/cl60kjfzg000i14nu1xwl8783';
const countryFillPaint: mapboxgl.FillPaint = {
    'fill-color': '#63ba34', // empty color
    'fill-opacity': 0.2,
};

const countryLinePaint: mapboxgl.LinePaint = {
    'line-color': '#f8f8f8',
    'line-width': 1,
};

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
                <Map
                    mapStyle={lightStyle}
                    mapOptions={{
                        logoPosition: 'bottom-left',
                    }}
                    scaleControlShown
                    navControlShown
                >
                    <MapContainer className={styles.mapContainer} />
                    <MapBounds
                        bounds={[50, 40, 90, 80]}
                        padding={50}
                    />
                    <MapSource
                        sourceKey="country"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson="mapbox://mapbox.3o7ubwm8"
                    >
                        <MapLayer
                            layerKey="country-fill"
                            layerOptions={{
                                type: 'fill',
                                paint: countryFillPaint,
                            }}
                        />
                        <MapLayer
                            layerKey="country-line"
                            layerOptions={{
                                type: 'line',
                                paint: countryLinePaint,
                            }}
                        />
                    </MapSource>
                </Map>
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
