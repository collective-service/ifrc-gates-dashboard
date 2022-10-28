import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
    compareNumber,
    isDefined,
} from '@togglecorp/fujs';
import {
    Heading,
    ContainerCard,
    ListView,
    useModalState,
    TextOutput,
    NumberOutput,
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
    MostRecentValuesQuery,
    MostRecentValuesQueryVariables,
    MapDataQuery,
    MapDataQueryVariables,
    HighestLowestCasesQuery,
    HighestLowestCasesQueryVariables,
} from '#generated/types';
import { FormatType } from '#utils/common';

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

const HIGHEST_LOWEST_CASES = gql`
    query HighestLowestCases(
        $emergency: String,
        $region: String,
    ) {
        descCountryEmergencyProfile: countryEmergencyProfile(
            filters: {
                contextIndicatorId: "new_cases_per_million",
                region: $region,
                emergency: $emergency,
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
            populationSize
            format
        }
        ascCountryEmergencyProfile: countryEmergencyProfile(
            filters: {
                contextIndicatorId: "new_cases_per_million",
                region: $region,
                emergency: $emergency,
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
            populationSize
            format
        }
    }
`;

const MOST_RECENT_CASES = gql`
    query MostRecentValues(
        $emergency: String,
        $region: String,
        $indicatorId: String,
    ) {
        descMostRecentValues: dataCountryLevelMostRecent(
            filters: {
                category: "Global"
                emergency: $emergency,
                region: $region,
                indicatorId: $indicatorId,
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
            format
        }
        ascMostRecentValues: dataCountryLevelMostRecent(
            filters: {
                category: "Global"
                emergency: $emergency,
                region: $region,
                indicatorId: $indicatorId,
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
            format
        }
    }
`;

type OverviewMapDataType = NonNullable<MapDataQuery['overviewMap']>[number];
type AscendingCountryProfileType = NonNullable<HighestLowestCasesQuery['ascCountryEmergencyProfile']>[number];
type DescendingCountryProfileType = NonNullable<HighestLowestCasesQuery['descCountryEmergencyProfile']>[number];

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

function MapTooltipData(indicatorData: OverviewMapDataType | undefined) {
    if (indicatorData?.format === 'percent') {
        return (Math.round((indicatorData?.indicatorValue) * 1000) / 100) ?? 0;
    }
    if (indicatorData?.format === 'raw') {
        return indicatorData?.indicatorValue;
    }
    return 0;
}

function Tooltip(props: TooltipProps) {
    const {
        countryName,
        lngLat,
        onHide,
        indicatorData,
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
                    <NumberOutput
                        suffix={indicatorData?.format === 'percent' ? '%' : '(Outbreak)'}
                        value={MapTooltipData(indicatorData)}
                        normal={indicatorData?.format === 'raw'}
                        precision={1}
                    />
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
    } = useQuery<MapDataQuery, MapDataQueryVariables>(
        MAP_DATA,
        {
            variables: mapVariables,
        },
    );

    const highestLowestCasesVariables = useMemo((): HighestLowestCasesQueryVariables => ({
        // indicatorId: filterValues?.indicator,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues,
    ]);
    const {
        data: highestLowestCasesData,
        loading: highestLowestCasesLoading,
    } = useQuery<HighestLowestCasesQuery, HighestLowestCasesQueryVariables>(
        HIGHEST_LOWEST_CASES,
        {
            skip: isDefined(filterValues?.indicator),
            variables: highestLowestCasesVariables,
        },
    );

    const highestValueWithoutIndicator = highestLowestCasesData
        ?.descCountryEmergencyProfile[0]?.contextIndicatorValue;

    /*
    FIX ME: This might be required to find the highest value for indicatorValue
    const indicatorValues = highestLowestValues?.descCountryEmergencyProfile?.map(
        (highCases) => (highCases?.contextIndicatorValue));
    const highestIndicatorValues = indicatorValues && Math.max(...indicatorValues.filter(
        (x): x is number => x !== null && x !== undefined));
    */

    const mostRecentVariables = useMemo(() => ({
        indicatorId: filterValues?.indicator,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [filterValues]);

    const {
        data: mostRecentValues,
        loading: mostRecentValuesLoading,
    } = useQuery<MostRecentValuesQuery, MostRecentValuesQueryVariables>(
        MOST_RECENT_CASES,
        {
            skip: !isDefined(filterValues?.indicator),
            variables: mostRecentVariables,
        },
    );

    const highestValueWithIndicator = mostRecentValues?.descMostRecentValues[0]?.indicatorValue;

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

    const recentHighValuesWithIndicator = mostRecentValues?.descMostRecentValues;
    const recentLowValuesWithIndicator = mostRecentValues?.ascMostRecentValues;
    // Note: This sorting logic maybe required in future
    // const sortedRecentLowValues = [...recentLowValuesWithIndicator ?? []]
    // .sort(compareLowestValues);

    const formatOnMap = mapIndicatorState[0]?.format ?? 'percent';

    const highestDataOnMap = formatOnMap === 'percent' ? 1 : mapIndicatorState[0]?.value;

    const progressBarRendererParams = useCallback(
        (_: string, data: AscendingCountryProfileType | DescendingCountryProfileType) => ({
            barHeight,
            barName: data.countryName ?? 'N/A',
            title: data.countryName ?? 'N/A',
            valueTitle: data.countryName ?? 'N/A',
            value: data?.contextIndicatorValue,
            totalValue: highestValueWithoutIndicator,
            color: '#98A6B5',
            format: data.format as FormatType,
        }), [highestValueWithoutIndicator],
    );

    const recentProgressBarRendererParams = useCallback(
        (
            _: string,
            data: AscendingMostRecentIndicatorType | DescendingMostRecentIndicatorType,
        ) => ({
            barHeight,
            barName: data.countryName ?? 'N/A',
            title: data.countryName ?? 'N/A',
            valueTitle: data.countryName ?? 'N/A',
            value: data.indicatorValue,
            totalValue: highestValueWithIndicator,
            color: '#98A6B5',
            format: data.format as FormatType,
        }),
        [highestValueWithIndicator],
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
                />
            </ContainerCard>
            <ContainerCard
                className={styles.progressBarContainer}
            >
                {filterValues?.indicator ? (
                    <>
                        <div className={styles.highProgressBox}>
                            <Heading size="extraSmall" className={styles.progressListHeader}>
                                Top Ranking
                            </Heading>
                            <ListView
                                className={styles.progressList}
                                keySelector={recentProgressBarKeySelector}
                                data={recentHighValuesWithIndicator}
                                renderer={ProgressBar}
                                rendererParams={recentProgressBarRendererParams}
                                filtered={false}
                                errored={false}
                                pending={mostRecentValuesLoading}
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
                                keySelector={recentProgressBarKeySelector}
                                data={recentLowValuesWithIndicator}
                                renderer={ProgressBar}
                                rendererParams={recentProgressBarRendererParams}
                                filtered={false}
                                errored={false}
                                pending={mostRecentValuesLoading}
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
                                Top Ranking
                            </Heading>
                            <ListView
                                className={styles.progressList}
                                keySelector={progressBarKeySelector}
                                data={highestLowestCasesData?.descCountryEmergencyProfile}
                                renderer={ProgressBar}
                                rendererParams={progressBarRendererParams}
                                filtered={false}
                                errored={false}
                                pending={highestLowestCasesLoading}
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
                                keySelector={progressBarKeySelector}
                                data={highestLowestCasesData?.ascCountryEmergencyProfile}
                                renderer={ProgressBar}
                                rendererParams={progressBarRendererParams}
                                filtered={false}
                                errored={false}
                                pending={highestLowestCasesLoading}
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
                        filterValues={filterValues}
                        selectedIndicatorName={selectedIndicatorName ?? undefined}
                    />
                )}
            </ContainerCard>
        </div>
    );
}
export default MapView;
