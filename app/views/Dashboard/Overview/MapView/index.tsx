import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    ContainerCard,
    ListView,
    useModalState,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import Map, {
    MapContainer,
    MapBounds,
    MapSource,
    MapLayer,
    MapState,
} from '@togglecorp/re-map';

import ProgressBar, { Props as ProgressBarProps } from '#components/ProgressBar';
import {
    MapIndicatorValuesQuery,
    MapIndicatorValuesQueryVariables,
} from '#generated/types';

import {
    progressDataOne,
    progressDataTwo,
} from '#utils/dummyData';

import { TabTypes } from '../..';
import { FilterType } from '../../Filters';
import MapModal from './MapModal';
import styles from './styles.css';

const progressBarKeySelector = (d: ProgressBarProps) => d.id;

interface MapViewProps {
    className?: string;
    isIndicatorSelected: boolean;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    filterValues?: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';
const countryFillPaint: mapboxgl.FillPaint = {
    // Color each country on the basis of outbreak
    'fill-color': [
        'interpolate',
        ['linear'],
        ['feature-state', 'contextIndicatorValue'],
        1,
        'rgba(33,102,172,0)',
        100,
        'rgb(103,169,207)',
        200,
        'rgb(209,229,240)',
        400,
        'rgb(253,219,199)',
        600,
        'rgb(239,138,98)',
        1000,
        'rgb(178,24,43)',
    ],
    'fill-opacity': 0.2,
};

const countryLinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 0.2,
};

const MAP_INDICATOR = gql`
    query MapIndicatorValues ($filters: CountryEmergencyProfileFilter) {
        countryEmergencyProfile(filters: $filters) {
            contextIndicatorValue
            iso3
            id
        }
    }
`;

const barHeight = 10;

function MapView(props: MapViewProps) {
    const {
        className,
        isIndicatorSelected,
        setActiveTab,
        filterValues,
        setFilterValues,
    } = props;

    // TODO: Map modal to be included in the mapbox.
    const [
        mapModalShown,
        showMapModal,
        hideMapModal,
    ] = useModalState(false);

    const [
        countryData,
        setCountryData,
    ] = useState<mapboxgl.MapboxGeoJSONFeature | undefined>();

    const mapIndicatorVariables = useMemo((): MapIndicatorValuesQueryVariables => ({
        filters: {
            contextIndicatorId: 'total_cases',
            emergency: filterValues?.outbreak,
        },
    }), [
        filterValues,
    ]);

    const {
        data: mapIndicatorValues,
    } = useQuery<MapIndicatorValuesQuery, MapIndicatorValuesQueryVariables>(
        MAP_INDICATOR,
        {
            variables: mapIndicatorVariables,
        },
    );

    console.log('Filter values in Mapview::>>', filterValues, mapIndicatorValues);

    const mapIndicatorState = useMemo(() => {
        const countryIndicator = mapIndicatorValues?.countryEmergencyProfile?.map(
            (indicatorValue) => ({
                id: indicatorValue?.id,
                value: 100,
            }));
        return countryIndicator;
    }, []);

    const handleCountryClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            setCountryData(feature);
            showMapModal();
            return true;
        },
        [showMapModal],
    );

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
                        zoom: 1,
                        minZoom: 0,
                        maxZoom: 3,
                    }}
                    scaleControlShown
                    navControlShown
                    navControlPosition="top-left"
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
                            // FIXME: set promoteId to whatever we get from geojson properties
                            // promoteId: 'XXX',
                        }}
                        geoJson="https://rcce-dashboard.s3.eu-west-3.amazonaws.com/countries.json"
                    >
                        <MapLayer
                            layerKey="country-fill"
                            layerOptions={{
                                type: 'fill',
                                paint: countryFillPaint,
                            }}
                            onClick={handleCountryClick}
                        />
                        <MapLayer
                            layerKey="country-line"
                            layerOptions={{
                                type: 'line',
                                paint: countryLinePaint,
                            }}
                        />
                        <MapState
                            attributeKey="contextIndicatorValue"
                            attributes={mapIndicatorState}
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
                {mapModalShown && (
                    <MapModal
                        onModalClose={hideMapModal}
                        setActiveTab={setActiveTab}
                        setFilterValues={setFilterValues}
                        countryData={countryData}
                    />
                )}
            </ContainerCard>
        </div>
    );
}
export default MapView;
