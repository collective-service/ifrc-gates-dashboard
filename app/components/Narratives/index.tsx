import React, { useState, useCallback } from 'react';
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

    const handleButtonClick = useCallback(() => {
        setIsSeeMore((old: boolean) => !old);
    }, [setIsSeeMore]);

    return (
        <div
            className={styles.narrativeWrapper}
        >
            <div className={styles.narrativeDetails}>
                Data Collection Info
                <Button
                    name={undefined}
                    variant="transparent"
                    onClick={handleButtonClick}
                >
                    See More
                    &nbsp;
                    {isSeeMore
                        ? <IoChevronUp />
                        : <IoChevronDown /> }
                </Button>
            </div>
            {isSeeMore && (
                narrative
            )}
        </div>
    );
}

export default Narratives;
