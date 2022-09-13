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

const MAP_INDICATOR = gql`
    query MapIndicatorValues ($filters: CountryEmergencyProfileFilter) {
        countryEmergencyProfile(filters: $filters) {
            contextIndicatorValue
            iso3
            id
        }
    }
`;
interface MapViewProps {
    className?: string;
    isIndicatorSelected: boolean;
}

const lightStyle = 'mapbox://styles/mapbox/light-v10';
const countryFillPaint: mapboxgl.FillPaint = {
<<<<<<< HEAD
    'fill-color': '#63ba34', // empty color
    'fill-opacity': 0.2,
=======
    // Color each country on the basis of outbreak
    'fill-color': [
        'interpolate',
        ['linear'],
        ['coalesce', ['feature-state', 'contextIndicatorValue'], 0],
        0,
        '#2F9F45',
        500000,
        '#EED322',
        750000,
        '#E6B71E',
        1000000,
        '#2F9C67',
        2500000,
        '#2F3345',
        5000000,
        '#2F9C67',
        7500000,
        '#2F9C67',
        10000000,
        '#2F9C67',
        25000000,
        '#723122',
    ],
    'fill-opacity': 0.5,
>>>>>>> Add new changes for map and pie-chart
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

<<<<<<< HEAD
=======
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

    const mapIndicatorState = useMemo(() => {
        const countryIndicator = mapIndicatorValues?.countryEmergencyProfile?.map(
            (indicatorValue) => ({
                id: indicatorValue.id,
                value: indicatorValue.contextIndicatorValue ?? 0,
                iso: indicatorValue.iso3,
            }),
        )
            .filter((item) => item.value > 0);
        return countryIndicator ?? [];
    }, [mapIndicatorValues?.countryEmergencyProfile]);

    const handleCountryClick = useCallback(
        (feature: mapboxgl.MapboxGeoJSONFeature) => {
            setCountryData(feature);
            showMapModal();
            return true;
        },
        [showMapModal],
    );

>>>>>>> Add new changes for map and pie-chart
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
<<<<<<< HEAD
=======
                            // FIXME: set promoteId to whatever we get from geojson properties
                            promoteId: 'id',
>>>>>>> Add new changes for map and pie-chart
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
