import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface MapViewProps {
    className?: string;
}

function MapView(props: MapViewProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.mapViewWrapper)}>
            <ContainerCard className={styles.mapContainer}>
                ---------------------------------
                ----The actual map will stay here----
                ---------------------------------
            </ContainerCard>
            <div className={styles.progressBarContainer}>
                ---------------------------------
                ----The progress bar will stay here----
                ---------------------------------
                ---------------------------------
                ---------------------------------
            </div>
        </div>
    );
}
export default MapView;
