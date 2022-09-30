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
// import { RegionBounds } from '#utils/regionBounds';
import {
    MostRecentValuesQuery,
    MostRecentValuesQueryVariables,
    OverviewMapDataQuery,
    OverviewMapDataQueryVariables,
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

const MAP_DATA = gql`
    query OverviewMapData (
        $emergency: String,
        $indicatorId: String,
        $region: String,
    ) {
        descCountryEmergencyProfile: countryEmergencyProfile(
            filters: {
                contextIndicatorId: $indicatorId,
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
                contextIndicatorId: $indicatorId,
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

type AscendingCountryProfileType = NonNullable<OverviewMapDataQuery['ascCountryEmergencyProfile']>[number];
type DescendingCountryProfileType = NonNullable<OverviewMapDataQuery['descCountryEmergencyProfile']>[number];

const MOST_RECENT_CASES = gql`
    query MostRecentValues(
        $emergency: String,
        $region: String,
    ) {
        descMostRecentValues: dataCountryLevelMostRecent(
            filters: {
                emergency: $emergency,
                region: $region,
            }
            pagination: {
                limit: 5,
                offset: 0,
            }
            order: {
                indicatorValue: DESC,
            }
        ) {
            id
            countryName
            iso3
            indicatorValue
            populationSize
        }
        ascMostRecentValues: dataCountryLevelMostRecent(
            filters: {
                emergency: $emergency,
                region: $region,
            }
            pagination: {
                limit: 5,
                offset: 0
            }
            order: {
                indicatorValue: ASC,
            }
        ) {
            id
            countryName
            iso3
            indicatorValue
            populationSize
        }
    }
`;

type AscendingMostRecentIndicatorType = NonNullable<MostRecentValuesQuery['descMostRecentValues']>[number];
type DescendingMostRecentIndicatorType = NonNullable<MostRecentValuesQuery['ascMostRecentValues']>[number];

const progressBarKeySelector = (
    d: AscendingCountryProfileType | DescendingCountryProfileType,
) => d.countryId;

const recentProgressBarKeySelector = (
    d: AscendingMostRecentIndicatorType | DescendingMostRecentIndicatorType,
) => d.id;

interface MapViewProps {
    className?: string;
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
        '#d73027',
        5000,
        '#f46d43',
        750000,
        '#fdae61',
        1000000,
        '#fee08b',
        2500000,
        '#ffffbf',
        5000000,
        '#d9ef8b',
        7500000,
        '#a6d96a',
        60000000,
        '#66bd63',
        91331830,
        '#1a9850',
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

    const variables = useMemo((): OverviewMapDataQueryVariables => ({
        indicatorId: filterValues?.indicator,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues,
    ]);

    const {
        data: overviewMapData,
    } = useQuery<OverviewMapDataQuery, OverviewMapDataQueryVariables>(
        MAP_DATA,
        {
            variables,
        },
    );

    /*
    FIX ME: This might be required to find the highest value for indicatorValue
    const indicatorValues = highestLowestValues?.descCountryEmergencyProfile?.map(
        (highCases) => (highCases?.contextIndicatorValue));
    const highestIndicatorValues = indicatorValues && Math.max(...indicatorValues.filter(
        (x): x is number => x !== null && x !== undefined));
    */

    const mostRecentVariables = useMemo(() => ({
        indicatorId: filterValues?.indicator,
        region: filterValues?.region,
    }), [filterValues]);

    const {
        data: mostRecentValues,
    } = useQuery<MostRecentValuesQuery, MostRecentValuesQueryVariables>(
        MOST_RECENT_CASES,
        {
            variables: mostRecentVariables,
        },
    );

    const mapIndicatorState = useMemo(() => {
        const countryIndicator = overviewMapData?.overviewMap?.map(
            (indicatorValue) => ({
                id: +indicatorValue.countryId,
                value: indicatorValue.indicatorValue ?? 0,
                iso: indicatorValue.iso3,
            }),
        )
            .filter((item) => item.value > 0);
        return countryIndicator ?? [];
    }, [overviewMapData?.overviewMap]);

    const handleCountryClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature) => {
            setCountryData(feature);
            showMapModal();
            return true;
        },
        [showMapModal],
    );

    const highestValuesWithoutIndicator = overviewMapData?.descCountryEmergencyProfile;
    const lowestValuesWithoutIndicator = overviewMapData?.ascCountryEmergencyProfile;

    const recentHighValuesWithIndicator = mostRecentValues?.descMostRecentValues;
    const recentLowValuesWithIndicator = mostRecentValues?.ascMostRecentValues;

    const progressBarRendererParams = useCallback(
        (_: string, data: AscendingCountryProfileType | DescendingCountryProfileType) => ({
            barHeight,
            suffix: 'M',
            barName: data.countryName,
            title: data.countryName ?? undefined,
            valueTitle: data.countryName ?? undefined,
            value: data.contextIndicatorValue,
            // FIXME: Use country population instead of highest indicator value
            totalValue: 100000000,
            color: '#98A6B5',
            isNumberValue: false,
        }), [],
    );

    const recentProgressBarRendererParams = useCallback(
        (_: string,
            data: AscendingMostRecentIndicatorType | DescendingMostRecentIndicatorType) => ({
            barHeight,
            suffix: '%',
            barName: data.countryName ?? undefined,
            title: data.countryName ?? undefined,
            valueTitle: data.countryName ?? undefined,
            value: data.indicatorValue,
            totalValue: data.populationSize,
            color: '#98A6B5',
            isNumberValue: false,
        }), [],
    );

    const handlePointHover = React.useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            const indicatorData = overviewMapData?.overviewMap?.find(
                (country) => country.iso3 === feature?.properties?.iso3,
            );

            setMapClickProperties({
                feature: feature as unknown as ClickedPoint['feature'],
                lngLat,
            });
            setSelectedCountryIndicator(indicatorData?.indicatorValue ?? 0);
            return true;
        },
        [setMapClickProperties, overviewMapData],
    );

    const handleHoverClose = React.useCallback(
        () => {
            setMapClickProperties(undefined);
            setSelectedCountryIndicator(undefined);
        },
        [setMapClickProperties],
    );

    // FIXME: this will be used when we get the data for bounds
    /*
    const selectedRegionBounds = useMemo(() => {
        const regionData = RegionBounds?.find(
            (region) => region.region === filterValues?.region,
        );
        return regionData?.bounding_box as [number, number, number, number];
    }, [filterValues]);
     */

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
                {/* FIXME: Need to send max value */}
                <MapLabel
                    className={styles.mapLabelBox}
                    isPercent
                />
            </ContainerCard>
            <ContainerCard
                className={styles.progressBarContainer}
            >
                {filterValues?.indicator ? (
                    <>
                        <div className={styles.highProgressBox}>
                            <Heading size="extraSmall" className={styles.progressListHeader}>
                                Highest cases
                            </Heading>
                            <ListView
                                className={styles.progressList}
                                keySelector={recentProgressBarKeySelector}
                                data={recentHighValuesWithIndicator}
                                renderer={ProgressBar}
                                rendererParams={recentProgressBarRendererParams}
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
                                keySelector={recentProgressBarKeySelector}
                                data={recentLowValuesWithIndicator}
                                renderer={ProgressBar}
                                rendererParams={recentProgressBarRendererParams}
                                filtered={false}
                                errored={false}
                                pending={false}
                                borderBetweenItem
                                borderBetweenItemWidth="medium"
                                borderBetweenItemClassName={styles.progressItemBorder}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.highProgressBox}>
                            <Heading size="extraSmall" className={styles.progressListHeader}>
                                Highest cases
                            </Heading>
                            <ListView
                                className={styles.progressList}
                                keySelector={progressBarKeySelector}
                                data={overviewMapData?.descCountryEmergencyProfile}
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
                                data={overviewMapData?.ascCountryEmergencyProfile}
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
                    </>
                )}
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
