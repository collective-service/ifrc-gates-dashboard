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
}

function Sources(props: Props) {
    const {
        className,
        link,
        title,
        sourceComment,
    } = props;

    return (
        <div
            className={_cs(className)}
            title={sourceComment}
        >
            <div className={styles.sourceHeading}>
                Sources
            </div>
            <div className={styles.perceptionCard}>
                <div className={styles.infoIcon}>
                    <IoInformationCircle />
                </div>
                <div>
                    {title}
                </div>
                <a
                    href={link}
                    className={styles.infoIcon}
                >
                    <BiLinkExternal />
                </a>
            </div>
        </div>
    );
}

export default Sources;
