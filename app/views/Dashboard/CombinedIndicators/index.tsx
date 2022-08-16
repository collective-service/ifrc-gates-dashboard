import { _cs } from '@togglecorp/fujs';
import React, { useCallback } from 'react';
import {
    ContainerCard,
    List,
} from '@the-deep/deep-ui';
import ProgressBar from '#components/ProgressBar';
import { sourcesProgressBarData } from '#utils/dummyData';

import styles from './styles.css';

const progressBarKeySelector = (d: ProgressBarRendererProps) => d.id;

const barHeight = 8;
export interface ProgressBarRendererProps {
    barName: string;
    title: string;
    id: string;
    value: number;
    regional: number;
    totalValue: number;
    color: string;
}
interface Props {
    className?: string;
}

function CombinedIndicators(props: Props) {
    const { className } = props;

    const progressBarRendererParams = useCallback(
        (_: string, data: ProgressBarRendererProps) => ({
            className: styles.progressBarItem,
            barHeight,
            suffix: '%',
            progressData: data,
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
                        renderer={ProgressBar}
                    />
                </ContainerCard>
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
                        renderer={ProgressBar}
                    />
                </ContainerCard>
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
                        renderer={ProgressBar}
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
