import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
    compareNumber,
    isDefined,
} from '@togglecorp/fujs';
import {
    Heading,
    PendingMessage,
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
import { regionBounds } from '#utils/regionBounds';
import {
    MapDataQuery,
    MapDataQueryVariables,
    TopBottomCountriesRankingQuery,
    TopBottomCountriesRankingQueryVariables,
} from '#generated/types';
import { formatNumber, FormatType } from '#utils/common';
import { TabTypes } from '#views/Dashboard';
import { FilterType } from '#views/Dashboard/Filters';

import MapModal from './MapModal';
import styles from './styles.css';

const tooltipOptions: mapboxgl.PopupOptions = {
    closeButton: false,
    offset: 8,
};

const MAP_DATA = gql`
    query MapData(
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
            format
        }
    }
`;

const TOP_BOTTOM_COUNTRIES_RANKING = gql`
    query TopBottomCountriesRanking (
        $emergency: String,
        $indicatorId: String,
        $region: String,
    ) {
        topCountriesRanking: overviewRanking(
            emergency: $emergency,
            indicatorId: $indicatorId,
            region: $region,
            isTop: true,
        ) {
            countryId
            countryName
            format
            indicatorValue
            iso3
        }
        bottomCountriesRanking: overviewRanking(
            emergency: $emergency,
            indicatorId: $indicatorId,
            region: $region,
            isTop: false,
        ) {
            countryId
            countryName
            format
            indicatorValue
            iso3
        }
    }
`;

type OverviewMapDataType = NonNullable<MapDataQuery['overviewMap']>[number];
type TopCountryType = NonNullable<TopBottomCountriesRankingQuery['topCountriesRanking']>[number];
type BottomCountryType = NonNullable<TopBottomCountriesRankingQuery['bottomCountriesRanking']>[number];

const countriesRankingKeySelector = (d: TopCountryType | BottomCountryType) => d.countryId;

interface MapViewProps {
    className?: string;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    filterValues?: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    selectedIndicatorName: string | undefined;
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
    indicatorData: OverviewMapDataType | undefined;
    indicatorName: string | undefined;
    onHide: () => void;
    lngLat: mapboxgl.LngLatLike;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';
const colors = [
    '#fff7fb',
    '#ece7f2',
    '#d0d1e6',
    '#a6bddb',
    '#74a9cf',
    '#3690c0',
    '#0570b0',
    '#045a8d',
    '#023858',
];

const countryLinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 0.2,
};

const barHeight = 10;
// NOTE: This sorting logic maybe required in future
/* function compareLowestValues(a, b) {
    const indicatorOne = a.indicatorValue;
    const indicatorTwo = b.indicatorValue;

    let comparison = 0;
    if (indicatorOne < indicatorTwo) {
        comparison = 1;
    } else if (indicatorOne > indicatorTwo) {
        comparison = -1;
    }
    return comparison;
} */

function Tooltip(props: TooltipProps) {
    const {
        countryName,
        lngLat,
        onHide,
        indicatorData,
        indicatorName,
    } = props;

    return (
        <MapTooltip
            coordinates={lngLat}
            tooltipOptions={tooltipOptions}
            trackPointer
            onHide={onHide}
        >
            <TextOutput
                block
                labelContainerClassName={styles.label}
                label={(
                    <>
                        {countryName}
                        {/* TODO: Get outbreak from server */}
                        <div className={styles.description}>
                            {isDefined(indicatorName)
                                ? indicatorName
                                : 'New cases per million for COVID-19'}
                        </div>
                    </>
                )}
                value={
                    formatNumber(
                        (indicatorData?.format ?? 'raw') as FormatType,
                        indicatorData?.indicatorValue,
                    )
                }
                hideLabelColon
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
        selectedIndicatorName,
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
    ] = React.useState<OverviewMapDataType | undefined>();

    const [
        countryData,
        setCountryData,
    ] = useState<mapboxgl.MapboxGeoJSONFeature | undefined>();

    const mapVariables = useMemo((): MapDataQueryVariables => ({
        indicatorId: filterValues?.indicator,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues,
    ]);

    const {
        data: overviewMapData,
        loading: mapDataLoading,
    } = useQuery<MapDataQuery, MapDataQueryVariables>(
        MAP_DATA,
        {
            variables: mapVariables,
        },
    );

    const countriesRankingVariables = useMemo(() => ({
        emergency: filterValues?.outbreak,
        indicatorId: filterValues?.indicator,
        region: filterValues?.region,
    }), [filterValues]);

    const {
        data: countriesRankingData,
        loading: countriesRankingLoading,
    } = useQuery<TopBottomCountriesRankingQuery, TopBottomCountriesRankingQueryVariables>(
        TOP_BOTTOM_COUNTRIES_RANKING,
        {
            variables: countriesRankingVariables,
        },
    );

    const topCountriesList = countriesRankingData?.topCountriesRanking;
    const bottomCountriesList = countriesRankingData?.bottomCountriesRanking;

    /*
    FIX ME: This might be required to find the highest value for indicatorValue
    const indicatorValues = highestLowestValues?.descCountryEmergencyProfile?.map(
        (highCases) => (highCases?.contextIndicatorValue));
    const highestIndicatorValues = indicatorValues && Math.max(...indicatorValues.filter(
        (x): x is number => x !== null && x !== undefined));
    */

    const mapIndicatorState = useMemo(() => {
        const countryIndicator = overviewMapData?.overviewMap?.map(
            (indicatorValue) => ({
                id: +indicatorValue.countryId,
                value: indicatorValue.indicatorValue ?? 0,
                iso: indicatorValue.iso3,
                format: indicatorValue.format,
            }),
        )
            .filter((item) => item.value > 0);
        const sortedData = [...(countryIndicator ?? [])]
            .sort((a, b) => compareNumber(a.value, b.value, -1));
        return sortedData;
    }, [overviewMapData?.overviewMap]);

    const handleCountryClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature) => {
            setCountryData(feature);
            showMapModal();
            return true;
        },
        [showMapModal],
    );

    const highestTopRankingValue = countriesRankingData?.topCountriesRanking[0]?.indicatorValue;

    // Note: This sorting logic maybe required in future
    // const sortedRecentLowValues = [...recentLowValuesWithIndicator ?? []]
    // .sort(compareLowestValues);

    const formatOnMap = mapIndicatorState[0]?.format ?? 'percent';

    const highestDataOnMap = formatOnMap === 'percent' ? 1 : mapIndicatorState[0]?.value;

    const countriesRankingRendererParams = useCallback(
        (
            _: string,
            data: TopCountryType | BottomCountryType,
        ) => ({
            barHeight,
            barName: data.countryName ?? 'N/A',
            title: data.countryName ?? 'N/A',
            valueTitle: data.countryName ?? 'N/A',
            value: data.indicatorValue,
            totalValue: highestTopRankingValue,
            color: '#98A6B5',
            format: data.format as FormatType,
        }),
        [highestTopRankingValue],
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
            setSelectedCountryIndicator(indicatorData);
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

    const selectedRegionBounds = useMemo(() => {
        if (doesObjectHaveNoData(filterValues)) {
            return (
                [90, -55, -90, 80] as [number, number, number, number]
            );
        }
        const regionData = regionBounds?.find(
            (region) => region.region === filterValues?.region,
        );
        return regionData?.bounding_box as [number, number, number, number];
    }, [
        filterValues,
    ]);

    const countryFillPaint: mapboxgl.FillPaint = useMemo(() => ({
        // Color each country on the basis of outbreak
        'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['feature-state', 'indicatorValue'], 0],
            ...(colors.map((color, index) => (
                [
                    (highestDataOnMap / (colors.length - 1)) * index,
                    color,
                ]
            )).flat()),
        ],
        'fill-opacity': 0.7,
    }), [highestDataOnMap]);

    return (
        <div className={_cs(className, styles.mapViewWrapper)}>
            <ContainerCard className={styles.mapContainer}>
                {mapDataLoading && <PendingMessage />}
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
                        bounds={selectedRegionBounds}
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
                            onMouseLeave={handleHoverClose}
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
                                indicatorData={selectedCountryIndicator}
                                indicatorName={selectedIndicatorName}
                                onHide={handleHoverClose}
                                lngLat={mapClickProperties.lngLat}
                            />
                        )}
                </Map>
                <MapLabel
                    /* NOTE: All values are indicator so minValue is always 0 */
                    minValue={0}
                    maxValue={highestDataOnMap}
                    className={styles.mapLabelBox}
                    isPercent={formatOnMap === 'percent'}
                    format={formatOnMap as FormatType}
                />
            </ContainerCard>
            <ContainerCard
                className={styles.progressBarContainer}
            >
                <div className={styles.highProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Top Ranking
                    </Heading>
                    <ListView
                        className={styles.progressList}
                        keySelector={countriesRankingKeySelector}
                        data={topCountriesList}
                        renderer={ProgressBar}
                        rendererParams={countriesRankingRendererParams}
                        filtered={false}
                        errored={false}
                        pending={countriesRankingLoading}
                        borderBetweenItem
                        borderBetweenItemWidth="medium"
                        borderBetweenItemClassName={styles.progressItemBorder}
                    />
                </div>
                <div className={styles.lowProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Bottom Ranking
                    </Heading>
                    <ListView
                        className={styles.progressList}
                        keySelector={countriesRankingKeySelector}
                        data={bottomCountriesList}
                        renderer={ProgressBar}
                        rendererParams={countriesRankingRendererParams}
                        filtered={false}
                        errored={false}
                        pending={countriesRankingLoading}
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
                        filterValues={filterValues}
                        selectedIndicatorName={selectedIndicatorName ?? undefined}
                    />
                )}
            </ContainerCard>
        </div>
    );
}
export default MapView;
