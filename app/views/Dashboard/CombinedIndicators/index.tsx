import { _cs } from '@togglecorp/fujs';
import React from 'react';
import { ContainerCard } from '@the-deep/deep-ui';

import styles from './styles.css';

interface CombinedIndicatorsProps {
    className?: string;
}

function CombinedIndicators(props: CombinedIndicatorsProps) {
    const { className } = props;

    return (
        <div className={_cs(className, styles.combinedIndicatorWrapper)}>
            <ContainerCard
                className={styles.combinedIndicatorMain}
                contentClassName={styles.progressBarContainer}
                heading="Communication"
                headingSize="extraSmall"
                headerDescription="Lorem ipsum explaining the topic"
            >
                <ContainerCard
                    className={styles.progressBarCard}
                    heading="Information Sources"
                    headingSize="extraSmall"
                    headerDescription="Lorem ipsum explaining the topic"
                >
                    Information Sources
                </ContainerCard>
                <ContainerCard
                    className={styles.progressBarCard}
                    heading="Trusted Channel"
                    headingSize="extraSmall"
                    headerDescription="Lorem ipsum explaining the topic"
                >
                    CombinedIndicators
                </ContainerCard>
                <ContainerCard
                    className={styles.progressBarCard}
                    heading="Demands"
                    headingSize="extraSmall"
                    headerDescription="Lorem ipsum explaining the topic"
                >
                    CombinedIndicators
                </ContainerCard>
            </ContainerCard>
            <ContainerCard
                className={styles.perceptionWrapper}
                contentClassName={styles.perceptionCard}
                heading="Sources"
                headingSize="extraSmall"
            >
                <p>COVID-19 Vaccine Perceptions in Africa</p>
            </ContainerCard>
        </div>
    );
}

export default CombinedIndicators;
