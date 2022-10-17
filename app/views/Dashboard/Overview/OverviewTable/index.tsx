import React, { useMemo, useState } from 'react';
import {
    compareString,
    _cs,
    listToGroupList,
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
    IoSearch,
} from 'react-icons/io5';

import {
    decimalToPercentage,
    rankedSearchOnList,
    normalCommaFormatter,
} from '#utils/common';
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
    searchText?: string;
    setSearchText?: React.Dispatch<React.SetStateAction<string | undefined>>;
    handleSearchChange?: () => void;
}

function countryListHeaderCell(props: CountryListHeaderCellProps) {
    const {
        className,
        setSearchText,
        searchText,
    } = props;

    return (
        <div className={_cs(styles.countryListHeaderCell, className)}>
            <TextInput
                icons={<IoSearch />}
                name="countryName"
                value={searchText}
                onChange={setSearchText}
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

    const [searchText, setSearchText] = useState<string | undefined>('');

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

    const filteredData = useMemo(() => (
        rankedSearchOnList(
            tableValues?.overviewTable ?? [],
            searchText,
            (item) => item.countryName,
        )
    ), [
        tableValues,
        searchText,
    ]);
    console.log('Check table data here::>>', filteredData);

    const columns = useMemo(
        () => {
            const groupedData = listToGroupList(
                filteredData,
                (d) => d.data[0].month,
                (d) => d.data[0],
            );

            const dateList = Object.keys(groupedData);

            // eslint-disable-next-line max-len
            const searchColumn: TableColumn<TableViewProps, string, CountryListCellProps, CountryListHeaderCellProps> = {
                id: 'search',
                title: '',
                headerCellRenderer: countryListHeaderCell,
                headerCellRendererClassName: styles.countryListHeaderCell,
                headerCellRendererParams: {
                    searchText,
                    setSearchText,
                },
                cellRenderer: countryListCell,
                cellRendererParams: (_, datum) => ({
                    title: datum.countryName,
                }),
                columnWidth: 130,
            };

            return [
                searchColumn,
                ...dateList.map(
                    (date) => (
                        createIndicatorColumn(
                            date.toLowerCase(),
                            new Date(date).toLocaleDateString('default', { month: 'short' }),
                            (item) => {
                                if (item?.data[0].month === date) {
                                    return String(item?.data?.[0]?.indicatorValue?.toFixed(2));
                                }
                                return '-';
                            },
                            { columnWidth: 30 },
                        )
                    ),
                ),
                /* createIndicatorColumn(
                     'jan',
                     'Jan',
                     (item) => {
                         const displayValue = new Date(item?.data?[0].month).getMonth() === 0,
                         )?.indicatorValue;

                         if (!displayValue) {
                             return '-';
                         }
                         const displayValueWithSuffix = filterValues?.indicator
                             ? `${decimalToPercentage(displayValue)}%`
                             : `${normalCommaFormatter().format(displayValue)}`;
                         return displayValueWithSuffix;
                     },
                     {
                         columnWidth: 30,
                     },
                 ),
                */
            ];
        },
        [
            filteredData,
            searchText,
        ],
    );

    return (
        <TableView
            className={_cs(className, styles.tableWrapper)}
            headerCellClassName={styles.headerRowStyle}
            cellClassName={styles.eachTableCell}
            columns={columns}
            keySelector={tableKeySelector}
            data={filteredData}
            errored={false}
            pending={tableValuesLoading}
            filtered={false}
            pendingMessage="Loading..."
            emptyMessage="No projects to show."
        />
    );
}

export default OverviewTable;
