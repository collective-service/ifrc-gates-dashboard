import React, { useMemo } from 'react';
import { compareString, _cs } from '@togglecorp/fujs';
import {
    TextInput,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    TableCell,
    TableCellProps,
    TableSortDirection,
    TableFilterType,
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
    title: string;
}

function countryListCell(props: CountryListCellProps) {
    const {
        title,
    } = props;

    return (
        <div className={styles.searchColumnCell}>
            {title}
        </div>
    );
}

function MyCell<T>(props: TableCellProps<T>) {
    const { className, value } = props;
    return (
        <div className={_cs(className, (value && +(value) > 40 && styles.highIndicator))}>
            <TableCell value={value} />
        </div>
    );
}

function createIndicatorColumn(
    id: string,
    title: string,
    accessor: (item: TableViewProps) => string,
    options?: {
        cellAsHeader?: boolean,
        sortable?: boolean,
        defaultSortDirection?: TableSortDirection,
        filterType?: TableFilterType,
        orderable?: boolean;
        hideable?: boolean;
        columnCellClassName?: string;
        columnClassName?: string;
        columnWidth?: TableColumn<TableViewProps, string, TableCellProps<string>, TableHeaderCellProps>['columnWidth'];
        columnStyle?: TableColumn<TableViewProps, string, TableCellProps<string>, TableHeaderCellProps>['columnStyle'];
    },
) {
    const item: TableColumn<
        TableViewProps,
        string,
        TableCellProps<string>,
        TableHeaderCellProps
    > & {
        valueSelector: (item: TableViewProps) => string | undefined | null,
        valueComparator: (foo: TableViewProps, bar: TableViewProps) => number,
    } = {
        id,
        title,
        cellAsHeader: options?.cellAsHeader,
        headerCellRenderer: TableHeaderCell,
        headerCellRendererParams: {
            sortable: options?.sortable,
            filterType: options?.filterType,
            orderable: options?.orderable,
            hideable: options?.hideable,
        },
        cellRenderer: MyCell,
        cellRendererParams: (_: string, datum: TableViewProps): TableCellProps<string> => ({
            value: accessor(datum),
            tooltip: accessor(datum),
            className: options?.columnCellClassName,
        }),
        valueSelector: accessor,
        valueComparator: (
            foo: TableViewProps,
            bar: TableViewProps,
        ) => compareString(accessor(foo), accessor(bar)),
        columnClassName: options?.columnClassName,
        columnWidth: options?.columnWidth,
        columnStyle: options?.columnStyle,
    };
    return item;
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
                id: 'search',
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
                columnWidth: 130,
            };

            return [
                searchColumn,
                // TODO: FIX COLOR INDICATORS FOR TABLE
                createIndicatorColumn(
                    'jan',
                    'Jan',
                    (item) => item.valueTwo,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'feb',
                    'Feb',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'mar',
                    'Mar',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'apr',
                    'Apr',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'may',
                    'May',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'jun',
                    'Jun',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'jul',
                    'July',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'aug',
                    'Aug',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'sep',
                    'Sep',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'oct',
                    'Oct',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'nov',
                    'Nov',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'dec',
                    'Dec',
                    (item) => item.valueOne,
                    {
                        columnWidth: 30,
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
