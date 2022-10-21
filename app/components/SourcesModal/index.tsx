import React, { useCallback } from 'react';
import {
    Modal,
    ListView,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import { SourcesQuery } from '#generated/types';
import Sources from '#components/Sources';

import styles from './styles.css';

type SourcesList = NonNullable<SourcesQuery['dataGranular']>[number];

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
        link: data?.link ?? '',
        sourceComment: data?.sourceComment ?? '',
        organization: data?.organisation ?? '',
        sourceDate: data?.sourceDate ?? '',
    }), []);
    return (
        <Modal
            size="medium"
            onCloseButtonClick={onModalClose}
            heading="Sources"
            headingClassName={styles.sourceHeading}
        >
            <ListView
                renderer={Sources}
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
