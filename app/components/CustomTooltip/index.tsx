import React from 'react';
import { normalCommaFormatter } from '../../utils/common';

interface Props {
    active?: false;
    payload?: {
        value?: number;
    }[];
    label?: string;
}

function CustomTooltip(props: Props) {
    const { active, payload, label } = props;

    if (active && payload && payload.length > 0) {
        return (
            <div>
                <p>
                    {`${label} : ${normalCommaFormatter().format(payload[0]?.value ?? 0)}`}
                </p>
            </div>
        );
    }
    return null;
}

export default CustomTooltip;
