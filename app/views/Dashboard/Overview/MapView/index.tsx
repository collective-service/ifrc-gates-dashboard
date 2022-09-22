import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Heading,
    ContainerCard,
    ListView,
    useModalState,
    TextOutput,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';
import Map, {
    MapContainer,
    MapBounds,
    MapSource,
    MapLayer,
    MapState,
    MapTooltip,
} from '@togglecorp/re-map';

import ProgressBar from '#components/ProgressBar';
import MapLabel from '#components/MapLabel';
import {
    normalFormatter,
} from '#utils/common';
import { RegionBounds } from '#utils/regionBounds';
import {
    MapIndicatorValuesQuery,
    MapIndicatorValuesQueryVariables,
    HighestLowestValuesQuery,
    HighestLowestValuesQueryVariables,
} from '#generated/types';

import { TabTypes } from '#views/Dashboard';
import { FilterType } from '#views/Dashboard/Filters';

import MapModal from './MapModal';
import styles from './styles.css';

const normalizedForm = (d: number) => normalFormatter().format(d);

const tooltipOptions: mapboxgl.PopupOptions = {
    closeButton: false,
    offset: 8,
};

const MAP_INDICATOR = gql`
    query MapIndicatorValues (
        $emergency: String,
        $indicatorId: String,
        $region: String,
        ) {
        overviewMap(
            indicatorId: $indicatorId,
            emergency: $emergency,
            region: $region,
            ) {
                iso3
                indicatorValue
                countryId
        }
    }
`;

const HIGHEST_LOWEST_CASES = gql`
    query HighestLowestValues(
        $contextIndicatorId: String,
        $region: String,
    ) {
        descCountryEmergencyProfile: countryEmergencyProfile(
            filters: {
                contextIndicatorId: $contextIndicatorId,
                region: $region,
            }
            pagination: {
                limit: 5,
                offset: 0,
            }
            order: {
                contextIndicatorValue: DESC,
            }
        ) {
            countryName
            countryId
            contextIndicatorValue
        }
        ascCountryEmergencyProfile: countryEmergencyProfile(
            filters: {
                contextIndicatorId: $contextIndicatorId,
                region: $region,
            }
            pagination: {
                limit: 5,
                offset: 0
            }
            order: {
                contextIndicatorValue: ASC,
            }
        ) {
            countryName
            countryId
            contextIndicatorValue
        }
    }
`;

type AscendingCountryProfileType = NonNullable<HighestLowestValuesQuery['ascCountryEmergencyProfile']>[number];
type DescendingCountryProfileType = NonNullable<HighestLowestValuesQuery['descCountryEmergencyProfile']>[number];

const progressBarKeySelector = (
    d: AscendingCountryProfileType | DescendingCountryProfileType,
) => d.countryId;

interface MapViewProps {
    className?: string;
    isIndicatorSelected: boolean;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    filterValues?: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
}

interface GeoJsonProps {
    id: number;
    // eslint-disable-next-line camelcase
    idmc_short: string;
}

interface ClickedPoint {
    feature: GeoJSON.Feature<GeoJSON.Point, GeoJsonProps>;
    lngLat: mapboxgl.LngLatLike;
}

interface TooltipProps {
    countryName: string | undefined;
    indicatorValue: number | undefined;
    onHide: () => void;
    lngLat: mapboxgl.LngLatLike;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';
const countryFillPaint: mapboxgl.FillPaint = {
    // Color each country on the basis of outbreak
    'fill-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['feature-state', 'indicatorValue'], 0],
        0,
        '#CB3809',
        5000,
        '#EED322',
        750000,
        '#D07149',
        1000000,
        '#E18700',
        2500000,
        '#2F3345',
        5000000,
        '#2F9C67',
        7500000,
        '#2F9C67',
        60000000,
        '#2F9C67',
        91331830,
        '#268504',
    ],
    'fill-opacity': 0.5,
};

const countryLinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 0.2,
};

const barHeight = 10;

function Tooltip(props: TooltipProps) {
    const {
        countryName,
        lngLat,
        onHide,
        indicatorValue,
    } = props;

    return (
        <MapTooltip
            coordinates={lngLat}
            tooltipOptions={tooltipOptions}
            onHide={onHide}
        >
            <TextOutput
                block
                label={countryName}
                value={(
                    <>
                        <TextOutput
                            description="(Outbreak)"
                            value={normalizedForm(indicatorValue ?? 0)}
                        />
                    </>
                )}
            />
        </MapTooltip>
    );
}

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
        mapClickProperties,
        setMapClickProperties,
    ] = React.useState<ClickedPoint | undefined>();

    const [
        selectedCountryIndicator,
        setSelectedCountryIndicator,
    ] = React.useState<number | undefined>();

    const [
        countryData,
        setCountryData,
    ] = useState<mapboxgl.MapboxGeoJSONFeature | undefined>();

    const mapIndicatorVariablesWithID = useMemo((): MapIndicatorValuesQueryVariables => ({
        indicatorId: filterValues?.indicator,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues,
    ]);

    const {
        data: mapIndicatorValues,
    } = useQuery<MapIndicatorValuesQuery, MapIndicatorValuesQueryVariables>(
        MAP_INDICATOR,
        {
            variables: mapIndicatorVariablesWithID,
        },
    );

    const highestLowestVariables = useMemo(() => ({
        contextIndicatorId: filterValues?.indicator,
        region: filterValues?.region,
    }), [filterValues]);

    const {
        data: highestLowestValues,
    } = useQuery<HighestLowestValuesQuery, HighestLowestValuesQueryVariables>(
        HIGHEST_LOWEST_CASES,
        {
            variables: highestLowestVariables,
        },
    );

    /*
    FIX ME: This might be required to find the highest value for indicatorValue
    const indicatorValues = highestLowestValues?.descCountryEmergencyProfile?.map(
        (highCases) => (highCases?.contextIndicatorValue));
    const highestIndicatorValues = indicatorValues && Math.max(...indicatorValues.filter(
        (x): x is number => x !== null && x !== undefined));
    */

    const mapIndicatorState = useMemo(() => {
        const countryIndicator = mapIndicatorValues?.overviewMap?.map(
            (indicatorValue) => ({
                id: +indicatorValue.countryId,
                value: indicatorValue.indicatorValue ?? 0,
                iso: indicatorValue.iso3,
            }),
        )
            .filter((item) => item.value > 0);
        return countryIndicator ?? [];
    }, [mapIndicatorValues?.overviewMap]);

    const handleCountryClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature) => {
            setCountryData(feature);
            showMapModal();
            return true;
        },
        [showMapModal],
    );

    const progressBarRendererParams = useCallback(
        (_: string, data: AscendingCountryProfileType | DescendingCountryProfileType) => ({
            barHeight,
            suffix: isIndicatorSelected ? '%' : 'M',
            barName: data.countryName ?? undefined,
            title: data.countryName ?? undefined,
            value: data.contextIndicatorValue ?? undefined,
            totalValue: 0,
            color: '#98A6B5',
            isNumberValue: !isIndicatorSelected,
        }), [isIndicatorSelected],
    );

    const handlePointHover = React.useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            const indicatorData = mapIndicatorValues?.overviewMap?.find(
                (country) => country.iso3 === feature?.properties?.iso3,
            );

            setMapClickProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                lngLat,
            });
            setSelectedCountryIndicator(indicatorData?.indicatorValue ?? 0);
            return true;
        },
        [setMapClickProperties, mapIndicatorValues],
    );

    const handleHoverClose = React.useCallback(
        () => {
            setMapClickProperties(undefined);
            setSelectedCountryIndicator(undefined);
        },
        [setMapClickProperties],
    );

    const selectedRegionBounds = useMemo(() => {
        const regionData = RegionBounds?.find(
            (region) => region.region === filterValues?.region,
        );
        return regionData?.bounding_box as [number, number, number, number];
    }, [filterValues]);

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
                        bounds={selectedRegionBounds ?? undefined}
                        padding={50}
                    />
                    <MapSource
                        sourceKey="country"
                        sourceOptions={{
                            type: 'geojson',
                            // FIXME: set promoteId to whatever we get from geojson properties
                            promoteId: 'id',
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
                            onMouseEnter={handlePointHover}
                        />
                        <MapLayer
                            layerKey="country-line"
                            layerOptions={{
                                type: 'line',
                                paint: countryLinePaint,
                            }}
                        />
                        <MapState
                            attributeKey="indicatorValue"
                            attributes={mapIndicatorState}
                        />
                    </MapSource>
                    {mapClickProperties?.lngLat && mapClickProperties?.feature?.id
                        && (
                            <Tooltip
                                countryName={mapClickProperties
                                    ?.feature?.properties?.idmc_short}
                                indicatorValue={selectedCountryIndicator}
                                onHide={handleHoverClose}
                                lngLat={mapClickProperties.lngLat}
                            />
                        )}
                </Map>
                {/* FIXME: Need to fix the label for map */}
                <MapLabel className={styles.mapLabelBox} />
            </ContainerCard>
            <ContainerCard
                className={styles.progressBarContainer}
            >
                <div className={styles.highProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Highest cases
                    </Heading>
                    <ListView
                        className={styles.progressList}
                        keySelector={progressBarKeySelector}
                        data={highestLowestValues?.descCountryEmergencyProfile}
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
                <div className={styles.lowProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Lowest cases
                    </Heading>
                    <ListView
                        className={styles.progressList}
                        keySelector={progressBarKeySelector}
                        data={highestLowestValues?.ascCountryEmergencyProfile}
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
