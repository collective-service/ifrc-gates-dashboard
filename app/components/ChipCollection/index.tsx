import React, { useCallback } from 'react';
import { Button } from '@the-deep/deep-ui';
import { IoCloseOutline } from 'react-icons/io5';

import Chip from './Chip';
import styles from './styles.css';

interface ChipCollectionProps {
    name: string;
    value?: string[] | null | undefined;
    onChange: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}

function ChipCollection(props: ChipCollectionProps) {
    const {
        name,
        value,
        onChange,
    } = props;

    const handleCancelOption = useCallback(
        (selectedKey) => {
            const newValue = value?.filter((key) => key !== selectedKey) ?? [];
            onChange(newValue);
        },
        [value, onChange],
    );

    return (
        <div className={styles.chipComponent}>
            <div className={styles.chipFilterHeader}>
                {`${name} filters:`}
            </div>
            <div className={styles.chipCollection}>
                {value?.map((key) => {
                    return (
                        <Chip
                            key={key}
                            label={key}
                            actionClassName={styles.chipActionButtons}
                            action={(
                                <Button
                                    name={key}
                                    onClick={handleCancelOption}
                                    title="Remove"
                                    spacing="none"
                                    variant="transparent"
                                >
                                    <IoCloseOutline />
                                </Button>
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default ChipCollection;
