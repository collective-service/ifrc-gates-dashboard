import React from 'react';
import HTMLOutput from '#components/HTMLOutput';

import styles from './styles.css';

interface Props {
    narrative: string;
}

function Narratives(props: Props) {
    const { narrative } = props;

    return (
        <div
            className={styles.narrativeWrapper}
        >
            <div className={styles.narrativeDetails}>
                Data Collection info
            </div>
            <HTMLOutput
                value={narrative}
            />
        </div>
    );
}

export default Narratives;
