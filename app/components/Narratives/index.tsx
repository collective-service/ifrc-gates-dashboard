import React, { useState } from 'react';
import { Button } from '@the-deep/deep-ui';
import {
    IoChevronUp,
    IoChevronDown,
} from 'react-icons/io5';

import styles from './styles.css';

interface Props {
    narrative: string;
}

function Narratives(props: Props) {
    const { narrative } = props;

    const [isSeeMore, setIsSeeMore] = useState<boolean>(false);

    return (
        <div
            className={styles.narrativeWrapper}
        >
            <div className={styles.narrativeDetails}>
                Data Collection Info
                <Button
                    name={undefined}
                    variant="transparent"
                    actions={(isSeeMore
                        ? <IoChevronUp />
                        : <IoChevronDown />
                    )}
                    onClick={() => setIsSeeMore((old: boolean) => !old)}
                >
                    See More
                </Button>
            </div>
            {isSeeMore && (
                narrative
            )}
        </div>
    );
}

export default Narratives;
