import React from 'react';

import { IoInformationCircle } from 'react-icons/io5';
import { BiLinkExternal } from 'react-icons/bi';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    TextOutput,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    link?: string | null;
    title?: string;
    sourceComment?: string;
    organization?: string | null;
    sourceDate?: string | null;
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
                <TextOutput
                    className={styles.label}
                    label={`
                        ${title}
                        ${isDefined(organization) ? `- ${organization}` : ''}
                        ${isDefined(sourceDate) ? `- ${sourceDate}` : ''}
                    `}
                    spacing="compact"
                    hideLabelColon
                />
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
        </div>
    );
}

export default Sources;
