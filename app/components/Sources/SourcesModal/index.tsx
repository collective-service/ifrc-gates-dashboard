import React, { useCallback } from 'react';
import {
    Modal,
    ListView,
} from '@the-deep/deep-ui';
import { CombinedSourcesQuery } from '#generated/types';

import Source from '../Source';

import styles from './styles.css';

type SourcesList = NonNullable<CombinedSourcesQuery['sources']>[number];

interface Props {
    onModalClose: () => void;
    sourcesList?: SourcesList[];
}
const sourcesKeySelector = (d: SourcesList) => d.id;

function SourcesModal(props: Props) {
    const {
        onModalClose,
        sourcesList,
    } = props;

    const sourcesRendererParams = useCallback((_, data: SourcesList) => ({
        title: data?.title ?? '',
        link: data?.link,
        sourceComment: data?.sourceComment ?? '',
        organization: data?.organisation,
        sourceDate: data?.sourceDate,
    }), []);
    return (
        <Modal
            size="medium"
            onCloseButtonClick={onModalClose}
            backdropClassName={styles.backdrop}
            heading="Sources"
            headingClassName={styles.sourceHeading}
        >
            <ListView
                className={styles.sources}
                renderer={Source}
                rendererParams={sourcesRendererParams}
                keySelector={sourcesKeySelector}
                data={sourcesList}
                errored={false}
                filtered={false}
                pending={false}
            />
        </Modal>
    );
}

export default SourcesModal;
