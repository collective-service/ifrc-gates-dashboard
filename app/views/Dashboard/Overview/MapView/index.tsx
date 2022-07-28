import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    ContainerCard,
    List,
} from '@the-deep/deep-ui';
import Map, {
    MapContainer,
    MapBounds,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import ProgressBar from '#components/ProgressBar';
import geoJson from '#utils/geoJson';
import {
    progressDataOne,
    progressDataTwo,
    boundsData,
} from '#utils/dummyData';

import styles from './styles.css';

const progressBarKeySelector = (d: ProgressBarRendererProps) => d.id;
export interface ProgressBarRendererProps {
    countryName: string;
    id: string;
    title: string;
    color: string;
    value: number;
    totalValue: number;
}

interface MapViewProps {
    className?: string;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';
const countryFillPaint: mapboxgl.FillPaint = {
    'fill-color': '#63ba34', // empty color
    'fill-opacity': 0.2,
};

const countryLinePaint: mapboxgl.LinePaint = {
    'line-color': '#f8f8f8',
    'line-width': 1,
};

const barHeight = 5;

function MapView(props: MapViewProps) {
    const {
        className,
    } = props;

    const progressBarRendererParams = useCallback(
        (_: string, data: ProgressBarRendererProps) => ({
            barHeight,
            progressData: data,
        }), [],
    );

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
                        bounds={boundsData}
                        padding={50}
                    />
                    <MapSource
                        sourceKey="country"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson={geoJson}
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
            <ContainerCard className={styles.progressBarContainer}>
                <div className={styles.progressRateBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Lowest cases
                    </Heading>
                    <div className={styles.progressList}>
                        <List
                            keySelector={progressBarKeySelector}
                            data={progressDataOne}
                            renderer={ProgressBar}
                            rendererParams={progressBarRendererParams}
                        />
                    </div>
                </div>
                <div className={styles.progressRateBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Highest cases
                    </Heading>
                    <div className={styles.progressList}>
                        <List
                            keySelector={progressBarKeySelector}
                            data={progressDataTwo}
                            renderer={ProgressBar}
                            rendererParams={progressBarRendererParams}
                        />
                    </div>
                </div>
            </ContainerCard>
        </div>
    );
}
export default MapView;
