import React, { useState, useCallback, useMemo } from 'react';
import { IoFileTraySharp } from 'react-icons/io5';
import {
    _cs,
    compareNumber,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Heading,
    PendingMessage,
    ContainerCard,
    ListView,
    useModalState,
    TextOutput,
    Message,
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
import { TabTypes, IndicatorType } from '#views/Dashboard';
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
        $subvariable: String,
    ) {
        overviewMap(
            indicatorId: $indicatorId,
            emergency: $emergency,
            region: $region,
            subvariable: $subvariable,
        ) {
            iso3
            indicatorValue
            indicatorMonth
            countryId
            format
            emergency
        }
    }
`;

const TOP_BOTTOM_COUNTRIES_RANKING = gql`
    query TopBottomCountriesRanking (
        $emergency: String,
        $indicatorId: String,
        $region: String,
        $subvariable: String,
    ) {
        topCountriesRanking: overviewRanking(
            emergency: $emergency,
            indicatorId: $indicatorId,
            region: $region,
            isTop: true,
            subvariable: $subvariable,
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
            subvariable: $subvariable,
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

function interpolate(maxValue: number, minValue: number, steps: number, position: number) {
    return minValue + ((maxValue - minValue) / steps) * position;
}

interface ClickedPoint {
    indicatorData: OverviewMapDataType,
    name: string,
    lngLat: mapboxgl.LngLatLike;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';
const colors = [
    '#ffffff',
    '#e0e4e9',
    '#c1c9d3',
    '#a3aebd',
    '#8595a8',
    '#687c93',
    '#4b647f',
    '#2d4e6b',
    '#023858',
];

const countryLinePaint: mapboxgl.LinePaint = {
    'line-color': '#000000',
    'line-width': 0.2,
};

const barHeight = 10;

interface TooltipProps {
    countryName: string | undefined;
    indicatorData: OverviewMapDataType | undefined;
    indicatorName: string;
    lngLat: mapboxgl.LngLatLike;
    onHide: () => void;
}

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
                            {indicatorName}
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

interface Props {
    className?: string;
    setActiveTab: React.Dispatch<React.SetStateAction<TabTypes | undefined>>;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
    selectedIndicatorName: string;
    indicatorId: string;
    regionId: string | undefined;
    outbreakId: string | undefined;
    subvariableId: string | undefined;
    indicatorExplicitlySet: boolean;
    selectedIndicatorType: IndicatorType | undefined;
    filterValues?: FilterType;
}

function MapView(props: Props) {
    const {
        className,
        setActiveTab,
        setFilterValues,
        selectedIndicatorName,
        indicatorId,
        regionId,
        outbreakId,
        subvariableId,
        indicatorExplicitlySet,
        selectedIndicatorType,
        filterValues,
    } = props;

    const [
        mapModalShown,
        showMapModal,
        hideMapModal,
    ] = useModalState(false);

    const [
        mapClickProperties,
        setMapClickProperties,
    ] = useState<ClickedPoint | undefined>();

    const [
        countryData,
        setCountryData,
    ] = useState<{ iso3: string, name: string } | undefined>();

    const mapVariables = useMemo((): MapDataQueryVariables => ({
        indicatorId,
        emergency: outbreakId,
        region: regionId,
        subvariable: subvariableId,
    }), [
        indicatorId, outbreakId, regionId, subvariableId,
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

    const countriesRankingVariables = useMemo((): TopBottomCountriesRankingQueryVariables => ({
        emergency: outbreakId,
        indicatorId,
        region: regionId,
        subvariable: subvariableId,
    }), [indicatorId, outbreakId, regionId, subvariableId]);

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

    // NOTE: Assuming first item has the maximum value
    const highestTopRankingValue = countriesRankingData?.topCountriesRanking[0]?.indicatorValue;

    const [
        mapIndicatorState,
        formatOnMap,
        lowestDataOnMap,
        highestDataOnMap,
        originalLowestDataOnMap,
        originalHighestDataOnMap,
    ] = useMemo(() => {
        const countryIndicator = overviewMapData?.overviewMap?.map(
            (indicatorValue) => {
                const val = indicatorValue.indicatorValue ?? 0;
                if (val <= 0) {
                    return undefined;
                }
                const format = indicatorValue.format as FormatType;

                let sanitizedValue = val;
                if (format === 'thousand' || format === 'million' || format === 'raw') {
                    sanitizedValue = Math.log10(val);
                }

                const value = {
                    id: Number(indicatorValue.countryId),
                    originalValue: val,
                    value: sanitizedValue,
                    iso: indicatorValue.iso3,
                    format: indicatorValue.format as FormatType,
                };
                return value;
            },
        )
            .filter(isDefined)
            .sort((a, b) => compareNumber(a.value, b.value, -1)) ?? [];

        if (countryIndicator.length <= 0) {
            return [
                [],
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            ];
        }

        // NOTE: we will always have a min and max item
        const maxItem = countryIndicator[0];
        const minItem = countryIndicator[countryIndicator.length - 1];

        const format = (maxItem?.format as FormatType | undefined) ?? 'percent';

        return [
            countryIndicator,
            format,
            format === 'percent'
                ? 0
                : minItem.value,
            format === 'percent'
                ? 1
                : maxItem.value,
            format === 'percent'
                ? 0
                : minItem.originalValue,
            format === 'percent'
                ? 1
                : maxItem.originalValue,
        ];
    }, [overviewMapData?.overviewMap]);

    const selectedRegionBounds = useMemo((): [number, number, number, number] => {
        const defaultBounds: [number, number, number, number] = [90, -55, -90, 80];
        if (isNotDefined(regionId)) {
            return defaultBounds;
        }
        const regionData = regionBounds?.find(
            (region) => region.region === regionId,
        );
        const regionBbox = regionData?.bounding_box as (
            [number, number, number, number] | undefined
        );
        return regionBbox ?? defaultBounds;
    }, [regionId]);

    const mapDataForSelectedCountry = useMemo(() => (
        overviewMapData?.overviewMap.find((country) => (
            country.iso3 === countryData?.iso3
        ))
    ), [
        overviewMapData?.overviewMap,
        countryData?.iso3,
    ]);

    const countryFillPaint: mapboxgl.FillPaint = useMemo(() => {
        if (isNotDefined(lowestDataOnMap) || isNotDefined(highestDataOnMap)) {
            return {
                'fill-color': '#f0f0f0',
                'fill-opacity': 0.7,
            };
        }

        return {
            // Color each country on the basis of outbreak
            'fill-color': [
                'case',
                ['==', ['typeof', ['feature-state', 'indicatorValue']], 'number'],
                [
                    'interpolate',
                    ['linear'],
                    ['coalesce', ['feature-state', 'indicatorValue'], lowestDataOnMap],
                    ...colors.flatMap((color, index) => ([
                        interpolate(highestDataOnMap, lowestDataOnMap, colors.length - 1, index),
                        color,
                    ])),
                ],
                'white',
            ],
            'fill-opacity': [
                'case',
                ['==', ['typeof', ['feature-state', 'indicatorValue']], 'number'],
                0.9,
                0,
            ],
        };
    }, [
        highestDataOnMap,
        lowestDataOnMap,
    ]);

    const countriesRankingRendererParams = useCallback(
        (_: string, data: TopCountryType | BottomCountryType) => ({
            barHeight,
            barName: data.countryName,
            title: data.countryName,
            valueTitle: data.countryName,
            value: data.indicatorValue,
            totalValue: highestTopRankingValue,
            color: '#98A6B5',
            format: data.format as FormatType,
        }),
        [highestTopRankingValue],
    );

    const handleClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature) => {
            const iso3 = feature?.properties?.iso3;
            // FIXME: here "idmc_short" should be replaced with some other name
            const name = feature?.properties?.idmc_short;

            const isValuePresent = (mapIndicatorState
                ?.find((country) => country.iso === iso3)?.originalValue ?? 0) > 0;

            if (!isValuePresent) {
                return true;
            }

            if (isDefined(name)) {
                setCountryData({
                    iso3,
                    name: name ?? iso3,
                });
                showMapModal();
            }
            return true;
        },
        [
            mapIndicatorState,
            showMapModal,
        ],
    );

    const handleHoverIn = React.useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature, lngLat: mapboxgl.LngLat) => {
            const indicatorData = overviewMapData?.overviewMap?.find(
                (country) => country.iso3 === feature?.properties?.iso3,
            );
            if (indicatorData) {
                setMapClickProperties({
                    indicatorData,
                    name: feature?.properties?.idmc_short ?? indicatorData?.iso3,
                    lngLat,
                });
            } else {
                setMapClickProperties(undefined);
            }
            return true;
        },
        [setMapClickProperties, overviewMapData],
    );

    const handleHoverOut = React.useCallback(
        () => {
            setMapClickProperties(undefined);
        },
        [setMapClickProperties],
    );

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
                        maxZoom: 3.5,
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
                            onClick={handleClick}
                            onMouseEnter={handleHoverIn}
                            onMouseLeave={handleHoverOut}
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
                    {mapClickProperties && (
                        <Tooltip
                            countryName={mapClickProperties.name}
                            indicatorData={mapClickProperties.indicatorData}
                            indicatorName={selectedIndicatorName}
                            onHide={handleHoverOut}
                            lngLat={mapClickProperties.lngLat}
                        />
                    )}
                </Map>
                {(
                    isDefined(originalLowestDataOnMap)
                    && isDefined(originalHighestDataOnMap)
                    && isDefined(formatOnMap)
                ) && (
                    <MapLabel
                        /* NOTE: All values are indicator so minValue is always 0 */
                        minValue={originalLowestDataOnMap}
                        maxValue={originalHighestDataOnMap}
                        className={styles.mapLabelBox}
                        format={formatOnMap}
                    />
                )}
            </ContainerCard>
            <ContainerCard
                className={styles.progressBarContainer}
            >
                <div className={styles.highProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Top Ranking
                    </Heading>
                    {(isDefined(bottomCountriesList) && (bottomCountriesList?.length > 0)) ? (
                        <ListView
                            className={styles.progressList}
                            keySelector={countriesRankingKeySelector}
                            data={topCountriesList}
                            renderer={ProgressBar}
                            rendererParams={countriesRankingRendererParams}
                            emptyMessage="No country data to show"
                            filtered={false}
                            errored={false}
                            pending={countriesRankingLoading}
                            borderBetweenItem
                            borderBetweenItemWidth="medium"
                            borderBetweenItemClassName={styles.progressItemBorder}
                        />
                    ) : (
                        <Message
                            emptyIcon={<IoFileTraySharp />}
                            empty
                            pending={countriesRankingLoading}
                            pendingContainerClassName={styles.pendingMessage}
                        />
                    )}
                </div>
                <div className={styles.lowProgressBox}>
                    <Heading size="extraSmall" className={styles.progressListHeader}>
                        Bottom Ranking
                    </Heading>
                    {(isDefined(bottomCountriesList) && (bottomCountriesList?.length > 0)) ? (
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
                    ) : (
                        <Message
                            emptyIcon={<IoFileTraySharp />}
                            empty
                            pending={countriesRankingLoading}
                            pendingContainerClassName={styles.pendingMessage}
                        />
                    )}
                </div>
                {mapModalShown && countryData && (
                    <MapModal
                        onModalClose={hideMapModal}
                        selectedIndicatorType={selectedIndicatorType}
                        setActiveTab={setActiveTab}
                        setFilterValues={setFilterValues}
                        indicatorId={indicatorId}
                        outbreakId={outbreakId}
                        countryData={countryData}
                        indicatorMonth={mapDataForSelectedCountry?.indicatorMonth}
                        format={mapDataForSelectedCountry?.format as (FormatType | undefined)}
                        indicatorValue={mapDataForSelectedCountry?.indicatorValue}
                        indicatorExplicitlySet={indicatorExplicitlySet}
                        filterValues={filterValues}
                    />
                )}
            </ContainerCard>
        </div>
    );
}
export default MapView;
