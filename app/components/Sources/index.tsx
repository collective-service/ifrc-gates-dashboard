import React from 'react';

import { IoInformationCircle } from 'react-icons/io5';
import { BiLinkExternal } from 'react-icons/bi';
import {
    _cs,
} from '@togglecorp/fujs';
import styles from './styles.css';

interface Props {
    className?: string;
    link?: string;
    title?: string;
    sourceComment?: string;
    organization?: string;
    sourceDate?: string;
}

function Sources(props: Props) {
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
            className={_cs(className, styles.sourcesWrapper)}
            title={sourceComment}
        >
            <div className={styles.perceptionCard}>
                <div className={styles.infoIcon}>
                    <IoInformationCircle />
                </div>
                <div>
                    {title}
                    {organization && `-(${organization})`}
                    {sourceDate && `-${sourceDate}`}
                </div>
                <a
                    href={link}
                    className={styles.infoIcon}
                    target="_blank"
                    rel="noreferrer"
                >
                    <BiLinkExternal />
                </a>
            </div>
        </div>
    );
}

export default Sources;
