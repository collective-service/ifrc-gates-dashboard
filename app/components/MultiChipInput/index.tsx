import React, { useCallback } from 'react';
import { Button } from '@the-deep/deep-ui';
import { IoCloseOutline } from 'react-icons/io5';

import Chip from './Chip';
import styles from './styles.css';

interface MultiChipProps<N> {
    name: N;
    label: string;
    disabled?: boolean;
    value?: string[] | null | undefined;
    onChange: (newValue: string[] | undefined, name: N) => void;
}

function MultiChipInput<N>(props: MultiChipProps<N>) {
    const {
        name,
        label,
        value,
        onChange,
        disabled,
    } = props;

    const handleCancelOption = useCallback(
        (selectedKey) => {
            const newValue = value?.filter((key) => key !== selectedKey);
            onChange(newValue, name);
        },
        [value, onChange, name],
    );

    return (
        <div className={styles.chipComponent}>
            <div className={styles.chipFilterHeader}>
                {`${label}:`}
            </div>
            <div className={styles.chipCollection}>
                {value?.map((key) => (
                    <Chip
                        key={key}
                        label={key}
                        disabled={disabled}
                        actionClassName={styles.chipActionButtons}
                        action={(
                            <Button
                                name={key}
                                onClick={handleCancelOption}
                                title="Remove"
                                spacing="none"
                                variant="transparent"
                                disabled={disabled}
                            >
                                <IoCloseOutline />
                            </Button>
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

export default MultiChipInput;
