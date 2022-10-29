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
}

function Source(props: Props) {
    const {
        className,
        link,
        title,
        sourceComment,
        organization,
        sourceDate,
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
                className={styles.label}
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
