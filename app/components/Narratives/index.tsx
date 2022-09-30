import React from 'react';
import HTMLOutput from '#components/HTMLOutput';

import styles from './styles.css';

interface Props {
    narrative: string | undefined;
}

function Narratives(props: Props) {
    const { narrative } = props;

    if (!narrative) {
        return null;
    }

    return (
        <div className={styles.narrativeWrapper}>
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
