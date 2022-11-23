import React from 'react';

import { IoInformationCircle } from 'react-icons/io5';
import { BiLinkExternal } from 'react-icons/bi';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
    link?: string | null;
    title?: string;
    sourceComment?: string;
    organization?: string | null;
    sourceDate?: string | null;
    variant?: 'regular' | 'mini';
}

function Source(props: Props) {
    const {
        className,
        link,
        title,
        sourceComment,
        organization,
        sourceDate,
        variant,
    } = props;

    return (
        <div
            className={_cs(className, styles.source)}
            title={sourceComment}
        >
            <div className={styles.infoIcon}>
                <IoInformationCircle />
            </div>
            <div
                className={_cs(
                    styles.label,
                    variant === 'mini' && styles.mini,
                )}
            >
                {`
                    ${title}
                    ${isDefined(organization) ? `- ${organization}` : ''}
                    ${isDefined(sourceDate) ? `- ${sourceDate}` : ''}
                `}
            </div>
            {link && (
                <a
                    href={link}
                    className={styles.infoIcon}
                    target="_blank"
                    rel="noreferrer"
                >
                    <BiLinkExternal />
                </a>
            )}
        </div>
    );
}

export default Source;
