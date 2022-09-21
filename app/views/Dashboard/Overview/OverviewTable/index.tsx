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
    const highValueIndicator = value && +(value) > 40;

    return (
        <div className={_cs(className, highValueIndicator && styles.highIndicator)}>
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
    filterValues?: FilterType | undefined;
    setFilterValues: React.Dispatch<React.SetStateAction<FilterType | undefined>>;
}

function OverviewTable(props: OverviewTableProps) {
    const {
        className,
        filterValues,
        setFilterValues,
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
    console.log('table values::>>', tableValues?.overviewTable);

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
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 0)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'feb',
                    'Feb',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 1)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'mar',
                    'Mar',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 2)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'apr',
                    'Apr',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 3)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'may',
                    'May',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 4)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'jun',
                    'Jun',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 5)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'jul',
                    'July',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 6)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'aug',
                    'Aug',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 7)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'sep',
                    'Sep',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 8)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'oct',
                    'Oct',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 9)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'nov',
                    'Nov',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 10)?.indicatorValue.toString() ?? '',
                    {
                        columnWidth: 30,
                    },
                ),
                createIndicatorColumn(
                    'dec',
                    'Dec',
                    (item) => item?.data?.find((val) => new Date(val.month).getMonth() === 11)?.indicatorValue.toString() ?? '',
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
