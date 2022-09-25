import React, { useMemo } from 'react';
import {
    compareString,
    _cs,
} from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
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

import { decimalToPercentage } from '#utils/common';
import {
    TableValuesQuery,
    TableValuesQueryVariables,
} from '#generated/types';
import { FilterType } from '#views/Dashboard/Filters';
import styles from './styles.css';

type TableViewProps = NonNullable<TableValuesQuery['overviewTable']>[number];

const tableKeySelector = (p: TableViewProps) => p.countryId;

const TABLE_DATA = gql`
    query TableValues (
        $emergency: String,
        $indicatorId: String,
        $region: String,
        ) {
        overviewTable(
            indicatorId: $indicatorId,
            emergency: $emergency,
            region: $region,
            ) {
                countryName
                countryId
                iso3
                data {
                    indicatorValue
                    month
                }
        }
    }
`;

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
    title: string | null | undefined;
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
    const highValueIndicator = value && +(value) > 60;

    return (
        <TableCell
            className={_cs(
                className,
                styles.cell,
                highValueIndicator && styles.highIndicator,
            )}
            value={value}
        />
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
interface Props {
    className?: string;
    filterValues?: FilterType | undefined;
}

function OverviewTable(props: Props) {
    const {
        className,
        filterValues,
    } = props;

    const tableVariables = useMemo((): TableValuesQueryVariables => ({
        indicatorId: filterValues?.indicator,
        emergency: filterValues?.outbreak,
        region: filterValues?.region,
    }), [
        filterValues,
    ]);

    const {
        data: tableValues,
        loading: tableValuesLoading,
    } = useQuery<TableValuesQuery, TableValuesQueryVariables>(
        TABLE_DATA,
        {
            variables: tableVariables,
        },
    );

    const columns = useMemo(
        () => {
            // eslint-disable-next-line max-len
            const searchColumn: TableColumn<TableViewProps, string, CountryListCellProps, CountryListHeaderCellProps> = {
                id: 'search',
                title: '',
                headerCellRenderer: countryListHeaderCell,
                headerCellRendererClassName: styles.countryListHeaderCell,
                headerCellRendererParams: {
                    sortable: true,
                },
                cellRenderer: countryListCell,
                cellRendererParams: (_, datum) => ({
                    title: datum.countryName,
                }),
                columnWidth: 130,
            };

            return [
                searchColumn,
                // TODO: FIX COLOR INDICATORS FOR TABLE
                createIndicatorColumn(
                    'jan',
                    'Jan',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 0)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'feb',
                    'Feb',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 1)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'mar',
                    'Mar',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 2)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'apr',
                    'Apr',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 3)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'may',
                    'May',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 4)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'jun',
                    'Jun',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 5)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'jul',
                    'July',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 6)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'aug',
                    'Aug',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 7)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'sep',
                    'Sep',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 8)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'oct',
                    'Oct',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 9)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'nov',
                    'Nov',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 10)?.indicatorValue) ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'dec',
                    'Dec',
                    (item) => decimalToPercentage(item?.data?.find((val) => new Date(val.month).getMonth() === 11)?.indicatorValue) ?? '',
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
            data={tableValues?.overviewTable}
            errored={false}
            pending={tableValuesLoading}
            filtered={false}
            pendingMessage="Loading..."
            emptyMessage="No projects to show."
        />
    );
}
export default OverviewTable;
