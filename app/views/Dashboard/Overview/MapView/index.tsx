import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    ContainerCard,
    ListView,
} from '@the-deep/deep-ui';
import Map, {
    MapContainer,
    MapBounds,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import ProgressBar, { Props as ProgressBarProps } from '#components/ProgressBar';

import {
    progressDataOne,
    progressDataTwo,
} from '#utils/dummyData';

import styles from './styles.css';

const progressBarKeySelector = (d: ProgressBarProps) => d.id;

interface MapViewProps {
    className?: string;
    isIndicatorSelected: boolean;
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

const barHeight = 10;

function MapView(props: MapViewProps) {
    const {
        className,
        isIndicatorSelected,
    } = props;

    const progressBarRendererParams = useCallback(
        (_: string, data: ProgressBarProps) => ({
            barHeight,
            suffix: isIndicatorSelected ? '%' : 'M',
            barName: data.barName,
            title: data.title,
            id: data.id,
            value: data.value,
            totalValue: data.totalValue,
            color: data.color,
        }), [isIndicatorSelected],
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
                        bounds={undefined}
                        padding={50}
                    />
                    <MapSource
                        sourceKey="country"
                        sourceOptions={{
                            type: 'geojson',
                        }}
                        geoJson="https://rcce-dashboard.s3.eu-west-3.amazonaws.com/countries.json"
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
            <ContainerCard
                className={styles.progressBarContainer}
            >
                <div className={styles.lowProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Lowest cases
                    </Heading>
                    <ListView
                        className={styles.progressList}
                        keySelector={progressBarKeySelector}
                        data={progressDataOne}
                        renderer={ProgressBar}
                        rendererParams={progressBarRendererParams}
                        filtered={false}
                        errored={false}
                        pending={false}
                        borderBetweenItem
                        borderBetweenItemWidth="medium"
                        borderBetweenItemClassName={styles.progressItemBorder}
                    />
                </div>
                <div className={styles.highProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Highest cases
                    </Heading>
                    <ListView
                        className={styles.progressList}
                        keySelector={progressBarKeySelector}
                        data={progressDataTwo}
                        renderer={ProgressBar}
                        rendererParams={progressBarRendererParams}
                        filtered={false}
                        errored={false}
                        pending={false}
                        borderBetweenItem
                        borderBetweenItemWidth="medium"
                        borderBetweenItemClassName={styles.progressItemBorder}
                    />
                </div>
            </ContainerCard>
        </div>
    );
}
export default MapView;
