import { _cs } from '@togglecorp/fujs';
import React, { useCallback } from 'react';
import {
    ContainerCard,
    List,
} from '@the-deep/deep-ui';
import MultiDataProgressBar from '#components/MultiDataProgressBar';
import { sourcesProgressBarData } from '#utils/dummyData';

import styles from './styles.css';

const progressBarKeySelector = (d: ProgressBarRendererProps) => d.id;

const barHeight = 15;
export interface ProgressBarRendererProps {
    title: string;
    id: string;
    country: number;
    regional: number;
    totalValue: number;
}
interface Props {
    className?: string;
}

function CombinedIndicators(props: Props) {
    const { className } = props;

    const progressBarRendererParams = useCallback(
        (_: string, data: ProgressBarRendererProps) => ({
            barHeight,
            suffix: '%',
            progressInfoData: data,
        }), [],
    );

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
                    contentClassName={styles.progressBar}
                >
                    <List
                        data={sourcesProgressBarData}
                        keySelector={progressBarKeySelector}
                        rendererParams={progressBarRendererParams}
                        renderer={MultiDataProgressBar}
                    />
                </ContainerCard>
                <ContainerCard
                    className={styles.progressBarCard}
                    heading="Trusted Channel"
                    headingSize="extraSmall"
                    headerDescription="Lorem ipsum explaining the topic"
                    contentClassName={styles.progressBar}
                >
                    <List
                        data={sourcesProgressBarData}
                        keySelector={progressBarKeySelector}
                        rendererParams={progressBarRendererParams}
                        renderer={MultiDataProgressBar}
                    />
                </ContainerCard>
                <ContainerCard
                    className={styles.progressBarCard}
                    heading="Demands"
                    headingSize="extraSmall"
                    headerDescription="Lorem ipsum explaining the topic"
                    contentClassName={styles.progressBar}
                >
                    <List
                        data={sourcesProgressBarData}
                        keySelector={progressBarKeySelector}
                        rendererParams={progressBarRendererParams}
                        renderer={MultiDataProgressBar}
                    />
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
