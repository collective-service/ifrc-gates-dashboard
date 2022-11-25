import React, {
    useMemo,
    useCallback,
    useState,
} from 'react';
import {
    DropdownMenu,
    DropdownMenuItem,
    useModalState,
    Modal,
    Button,
} from '@the-deep/deep-ui';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import {
    IoDownloadOutline,
} from 'react-icons/io5';

import {
    ExportMetaQuery,
    ExportMetaQueryVariables,
} from '#generated/types';
import {
    formatNumber,
} from '#utils/common';
import useRecursiveCsvExport from '#hooks/useRecursiveCSVExport';
import ProgressBar from '#components/ProgressBar';

import styles from './styles.css';

type ExportTypes = 'raw' | 'summarized' | 'contextual';

const EXPORT_META = gql`
    query ExportMeta(
        $iso3: String,
        $indicatorId:String
    ) {
        exportMeta(
            iso3: $iso3,
            indicatorId: $indicatorId,
        ) {
            maxPageLimit
            totalCountryContextualDataCount
            totalRawDataCount
            totalSummaryCount
        }
    }
`;

interface Props {
    className?: string;
    indicatorId?: string;
    countryId?: string;
}

function Export(props: Props) {
    const {
        className,
        indicatorId,
        countryId,
    } = props;

    const [
        confirmExportModalShown,
        showExportConfirm,
        hideExportConfirm,
    ] = useModalState(false);

    const [selectedExport, setSelectedExport] = useState<ExportTypes | undefined>(undefined);

    const exportMetaVariables = useMemo(() => {
        if (isDefined(indicatorId) || isDefined(countryId)) {
            return {
                iso3: countryId,
                indicatorId,
            };
        }
        return undefined;
    }, [
        indicatorId,
        countryId,
    ]);

    const {
        data: exportMetaCount,
        loading: exportMetaLoading,
    } = useQuery<ExportMetaQuery, ExportMetaQueryVariables>(
        EXPORT_META,
        {
            skip: !exportMetaVariables,
            variables: exportMetaVariables,
        },
    );

    const handleExportClick = useCallback((name: ExportTypes) => {
        setSelectedExport(name);
        showExportConfirm();
    }, [
        showExportConfirm,
    ]);

    const handleExportCancel = useCallback(() => {
        setSelectedExport(undefined);
        hideExportConfirm();
    }, [
        hideExportConfirm,
    ]);

    const exportParams = useMemo(() => {
        if (isDefined(indicatorId) || isDefined(countryId)) {
            return {
                iso3: countryId,
                indicator_id: indicatorId,
                include_header: true,
            };
        }
        return {};
    }, [
        indicatorId,
        countryId,
    ]);

    const [
        pendingExport,
        progress,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        onFailure: (err) => {
            // eslint-disable-next-line no-console
            console.error('Failed to download!', err);
        },
        onSuccess: (data) => {
            const unparseData = Papa.unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, 'Data Export.csv');
        },
    });

    const handleExportConfirm = useCallback(() => {
        if (selectedExport === 'raw' && exportMetaCount?.exportMeta?.totalRawDataCount) {
            triggerExportStart(
                'server://export-raw-data/',
                exportMetaCount?.exportMeta?.totalRawDataCount,
                exportParams,
            );
        } else if (selectedExport === 'summarized' && exportMetaCount?.exportMeta?.totalSummaryCount) {
            triggerExportStart(
                'server://export-summary/',
                exportMetaCount?.exportMeta?.totalSummaryCount,
                exportParams,
            );
        } else if (selectedExport === 'contextual' && exportMetaCount?.exportMeta?.totalCountryContextualDataCount) {
            triggerExportStart(
                'server://export-country-contextual-data/',
                exportMetaCount?.exportMeta?.totalCountryContextualDataCount,
                exportParams,
            );
        }
        hideExportConfirm();
        setSelectedExport(undefined);
    }, [
        hideExportConfirm,
        exportParams,
        triggerExportStart,
        selectedExport,
        exportMetaCount,
    ]);

    const disableExportButton = exportMetaLoading
        || pendingExport
        || isNotDefined(countryId || indicatorId)
        || (
            (exportMetaCount?.exportMeta?.totalRawDataCount ?? 0) === 0
            && (exportMetaCount?.exportMeta?.totalSummaryCount ?? 0) === 0
            && (exportMetaCount?.exportMeta?.totalCountryContextualDataCount ?? 0) === 0
        );

    return (
        <>
            <DropdownMenu
                className={className}
                label={pendingExport
                    ? `Preparing Export (${formatNumber('percent', progress)})`
                    : 'Export'}
                variant="tertiary"
                icons={<IoDownloadOutline />}
                hideDropdownIcon
                disabled={disableExportButton}
            >
                {(exportMetaCount?.exportMeta?.totalRawDataCount ?? 0) > 0 && (
                    <DropdownMenuItem
                        name="raw"
                        onClick={handleExportClick}
                    >
                        Export Raw Data as CSV
                    </DropdownMenuItem>
                )}
                {(exportMetaCount?.exportMeta?.totalSummaryCount ?? 0) > 0 && (
                    <DropdownMenuItem
                        name="summarized"
                        onClick={handleExportClick}
                    >
                        Export Summarized Data
                    </DropdownMenuItem>
                )}
                {(exportMetaCount?.exportMeta?.totalCountryContextualDataCount ?? 0) > 0 && (
                    <DropdownMenuItem
                        name="contextual"
                        onClick={handleExportClick}
                    >
                        Export Contextual Country Data
                    </DropdownMenuItem>
                )}
            </DropdownMenu>
            {confirmExportModalShown && (
                <Modal
                    heading="Export Confirmation"
                    onCloseButtonClick={handleExportCancel}
                    freeHeight
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={handleExportCancel}
                                variant="secondary"
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleExportConfirm}
                            >
                                Continue
                            </Button>
                        </>
                    )}
                >
                    Exporting data for your current selection
                    might take a bit of time due to its size.
                    Are you sure you want to continue?
                </Modal>
            )}
            {pendingExport && (
                <div className={styles.exportProgressPopup}>
                    <div className={styles.topContainer}>
                        Preparing Export...
                    </div>
                    <ProgressBar
                        className={styles.progressBar}
                        color="var(--dui-color-brand)"
                        barName={undefined}
                        value={progress}
                        totalValue={1}
                        format="percent"
                        hideTooltip
                    />
                </div>
            )}
        </>
    );
}

export default Export;
