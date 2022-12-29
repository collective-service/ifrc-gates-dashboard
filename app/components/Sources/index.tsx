import React, { useMemo, useCallback } from 'react';
import {
    IoChevronDownOutline,
} from 'react-icons/io5';
import { gql, useQuery } from '@apollo/client';
import {
    Container,
    Button,
    ListView,
    useModalState,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import {
    CombinedSourcesQueryVariables,
    CombinedSourcesQuery,
} from '#generated/types';

import Source from './Source';
import SourcesModal from './SourcesModal';

import styles from './styles.css';

type SourcesList = NonNullable<CombinedSourcesQuery['sources']>[number];
const sourcesKeySelector = (d: SourcesList) => d.id;

const COMBINED_SOURCES = gql`
    query CombinedSources(
        $iso3: String,
        $emergency: String,
        $subvariable: String,
        $indicatorId: String,
    ) {
        sources(
            iso3: $iso3,
            emergency: $emergency,
            indicatorId: $indicatorId,
            subvariable: $subvariable,
        ) {
            id
            title
            link
            sourceComment
            organisation
            sourceDate
            indicatorMonth
        }
    }
`;

interface Props {
    className?: string;
    country?: string;
    emergency?: string;
    subvariable?: string;
    variant?: 'regular' | 'mini';
    indicatorId?: string;
}

function Sources(props: Props) {
    const {
        className,
        country,
        emergency,
        subvariable,
        indicatorId,
        variant = 'regular',
    } = props;

    const [
        sourceModalShown,
        showSourceModal,
        hideSourceModal,
    ] = useModalState(false);

    const sourcesVariables = useMemo((): CombinedSourcesQueryVariables => ({
        iso3: country,
        emergency,
        subvariable,
        indicatorId,
    }), [
        country,
        emergency,
        indicatorId,
        subvariable,
    ]);

    const {
        data: sourcesResponse,
    } = useQuery<CombinedSourcesQuery, CombinedSourcesQueryVariables>(
        COMBINED_SOURCES,
        {
            variables: sourcesVariables,
        },
    );

    const sourcesList = useMemo(() => (
        variant === 'mini'
            ? sourcesResponse?.sources
            : sourcesResponse?.sources.slice(0, 3)
    ), [
        variant,
        sourcesResponse,
    ]);

    const sourcesRendererParams = useCallback((_, data: SourcesList) => ({
        title: data?.title ?? '',
        link: data?.link,
        sourceDate: data?.sourceDate,
        sourceComment: data?.sourceComment ?? '',
        organization: data?.organisation,
        variant,
    }), [variant]);

    if ((sourcesResponse?.sources?.length ?? 0) === 0) {
        return null;
    }

    return (
        <Container
            className={_cs(
                className,
                styles.sources,
                variant === 'mini' && styles.mini,
            )}
            heading="Sources"
            headingClassName={styles.heading}
            headingSize="extraSmall"
            spacing="compact"
            headerActions={(sourcesResponse?.sources.length ?? 0) > 3 && variant === 'regular' && (
                <Button
                    name={undefined}
                    variant="transparent"
                    onClick={showSourceModal}
                    actions={<IoChevronDownOutline />}
                >
                    View all
                </Button>
            )}
        >
            <ListView
                renderer={Source}
                rendererParams={sourcesRendererParams}
                keySelector={sourcesKeySelector}
                data={sourcesList}
                errored={false}
                filtered={false}
                pending={false}
            />
            {sourceModalShown && (
                <SourcesModal
                    onModalClose={hideSourceModal}
                    sourcesList={sourcesResponse?.sources}
                />
            )}
        </Container>
    );
}

export default Sources;
