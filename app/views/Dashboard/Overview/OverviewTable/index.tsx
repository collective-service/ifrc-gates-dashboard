import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    TableView,
    createStringColumn,
    TableColumn,
} from '@the-deep/deep-ui';
import {
    IoIosSearch,
} from 'react-icons/io';

import { overviewTableData } from '#utils/dummyData';
import styles from './styles.css';

const tableKeySelector = (p: TableViewProps) => p.id;

export interface TableViewProps {
    id: string;
    country: string;
    valueOne: string;
    valueTwo: string;
    month: string;
    high?: boolean;
}
interface CountryListHeaderCellProps {
    className: string;
}

function countryListHeaderCell(props: CountryListHeaderCellProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.countryListHeaderCell, className)}>
            <TextInput
                icons={<IoIosSearch />}
                name="countryName"
                value={undefined}
                onChange={undefined}
                placeholder="Search"
                variant="general"
            />
        </div>
    );
}
interface CountryListCellProps {
    className: string;
    title: string;
}

function countryListCell(props: CountryListCellProps) {
    const {
        className,
        title,
    } = props;

    return (
        <div className={_cs(styles.countryListCell, className)}>
            {title}
        </div>
    );
}

interface OverviewTableProps {
    className?: string;
}

function OverviewTable(props: OverviewTableProps) {
    const {
        className,
    } = props;

    const columns = useMemo(
        () => {
            // eslint-disable-next-line max-len
            const searchColumn: TableColumn<TableViewProps, string, CountryListCellProps, CountryListHeaderCellProps> = {
                id: 'action',
                title: '',
                headerCellRenderer: countryListHeaderCell,
                headerCellRendererClassName: styles.countryListHeaderCell,
                headerCellRendererParams: {
                    sortable: false,
                },
                cellRenderer: countryListCell,
                cellRendererParams: (_, datum) => ({
                    title: datum.country,
                }),
                columnWidth: 400,
            };
            return [
                searchColumn,
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Jan',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueOne;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Feb',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Mar',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Apr',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'May',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueOne;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Jun',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Jul',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Aug',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueOne;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Sep',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Oct',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Nov',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
                createStringColumn<TableViewProps, string>(
                    'month',
                    'Dec',
                    (item) => {
                        if (item.high) {
                            return (
                                <div style={{ color: 'blue' }}>
                                    {item?.valueTwo}
                                </div>
                            );
                        }
                        return item?.valueTwo;
                    },
                ),
            ];
        }, [],
    );

    return (
        <TableView
            className={_cs(className, styles.tableWrapper)}
            headerCellClassName={styles.headerRowStyle}
            cellClassName={styles.eachTableCell}
            columns={columns}
            keySelector={tableKeySelector}
            data={overviewTableData}
            errored={false}
            pending={false}
            filtered={false}
            emptyMessage="No projects to show."
        />
    );
}
export default OverviewTable;
