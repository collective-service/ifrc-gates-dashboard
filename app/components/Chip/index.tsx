import React, { ReactNode, useMemo } from 'react';
import {
    _cs,
    getContrastYIQ,
} from '@togglecorp/fujs';

import styles from './styles.css';

export type ChipVariant = (
    'accent'
    | 'danger'
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
);

const chipVariantToVariableNameMap: {
    [key in ChipVariant]: string;
} = {
    accent: '--tui-color-accent',
    danger: '--tui-color-danger',
    primary: '--tui-color-primary',
    warning: '--tui-color-warning',
    success: '--tui-color-success',
    default: '--tui-color-background-button',
};

export interface ChipProps {
    /**
    * Variant of the chip
     */
    variant?: ChipVariant;
    /**
    * Class name for Chip
     */
    className?: string;
    /**
     * Label for the chip
     */
    label?: ReactNode,
    /**
     * Class name of Chip label
     */
    labelClassName?: string;
    /**
     * Left component of the chip
     */
    icon?: ReactNode,
    /**
     * Class name of icon
     */
    iconClassName?: string;
    /**
     * Right component of the chip
     */
    action?: ReactNode;
    /**
     * Class name for action
     */
    actionClassName?: string;
    /**
     * Class name for children container
     */
    childrenClassName?: string;
    /**
     * Children for the chip
     */
    children?: ReactNode;

    disabled?: boolean;
}

function Chip(props: ChipProps) {
    const {
        variant = 'default',
        label,
        icon,
        action,
        className,
        labelClassName,
        iconClassName,
        actionClassName,
        children,
        childrenClassName,
        disabled,
    } = props;

    const chipClassName = _cs(
        className,
        styles.chip,
        variant,
        styles[variant],
        disabled && styles.disabled,
    );

    return (
        <div className={chipClassName}>
            {icon && (
                <div
                    className={_cs(
                        styles.icon,
                        iconClassName,
                    )}
                >
                    {icon}
                </div>
            )}
            {children && (
                <div
                    className={_cs(childrenClassName, styles.children)}
                >
                    {children}
                </div>
            )}
            {!children && label && (
                <div
                    className={_cs(
                        styles.label,
                        labelClassName,
                    )}
                >
                    {label}
                </div>
            )}
            {action && (
                <div
                    className={_cs(
                        styles.action,
                        actionClassName,
                    )}
                >
                    {action}
                </div>
            )}
        </div>
    );
}

export default Chip;
