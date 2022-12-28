import React, { useMemo, useState } from 'react';
import {
    _cs,
    compareNumber,
    encodeDate,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    TextInput,
    TableView,
    TableColumn,
    TableHeaderCell,
    useSortState,
    SortContext,
    TableSortDirection,
} from '@the-deep/deep-ui';
import {
    IoSearch,
} from 'react-icons/io5';

import {
    rankedSearchOnList,
    formatNumber,
    FormatType,
} from '#utils/common';
import {
    TableValuesQuery,
    TableValuesQueryVariables,
} from '#generated/types';
import styles from './styles.css';

function getMonthList() {
    const latestMonth = new Date();

    const months = [];
    for (let i = 0; i < 12; i += 1) {
        latestMonth.setMonth(latestMonth.getMonth() - 1);
        latestMonth.setDate(1);

        months.push(encodeDate(latestMonth));
    }
    return months.reverse();
}

function getTextColorForHex(inputHex: string) {
    const hexColor = inputHex.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

interface TableData {
    countryName: string;
    countryId: string;
    iso3: string;
    data: {
        [key: string]: number | undefined,
    };
    format: FormatType;
}

interface ColorRange {
    minValue: number;
    maxValue: number;
    color: string;
}

const tableKeySelector = (p: TableData) => p.countryId;

const colors = [
    '#ffffff',
    '#e0e4e9',
    '#c1c9d3',
    '#a3aebd',
    '#8595a8',
    '#687c93',
    '#4b647f',
    '#2d4e6b',
    '#023858',
];

const monthList = getMonthList();

const TABLE_DATA = gql`
    query TableValues (
        $emergency: String,
        $indicatorId: String,
        $region: String,
        $subvariable: String,
    ) {
        overviewTable(
            indicatorId: $indicatorId,
            emergency: $emergency,
            region: $region,
            subvariable: $subvariable,
            ) {
                countryName
                countryId
                iso3
                data {
                    indicatorValue
                    month
                    format
                }
        }
    }
`;

interface CountryListHeaderCellProps {
    className: string;
    searchText?: string;
    onSearchTextChange?: React.Dispatch<React.SetStateAction<string | undefined>>;
}
function CountryListHeaderCell(props: CountryListHeaderCellProps) {
    const {
        className,
        onSearchTextChange,
        searchText,
    } = props;

    return (
        <div className={_cs(styles.countryListHeaderCell, className)}>
            <TextInput
                icons={<IoSearch />}
                name="countryName"
                value={searchText}
                onChange={onSearchTextChange}
                placeholder="Search"
                variant="general"
            />
        </div>
    );
}

interface CountryListCellProps {
    title: string | null | undefined;
}
function CountryListCell(props: CountryListCellProps) {
    const {
        title,
    } = props;

    return (
        <div className={styles.searchColumnCell}>
            {title}
        </div>
    );
}

interface IndicatorValueProps {
    className?: string;
    value?: number;
    colorRange?: ColorRange[];
    format: FormatType;
}

function IndicatorValue(props: IndicatorValueProps) {
    const {
        className,
        colorRange,
        value,
        format,
    } = props;

    const color = useMemo(() => {
        const defaultColor = colors[0];

        if (isNotDefined(value)) {
            return defaultColor;
        }

        return colorRange?.find(
            (range) => value > range.minValue && value <= range.maxValue,
        )?.color ?? defaultColor;
    }, [
        colorRange,
        value,
    ]);

    return (
        <div
            className={_cs(
                className,
                styles.cell,
            )}
            style={{
                backgroundColor: color,
                color: getTextColorForHex(color),
            }}
        >
            {isDefined(value) ? formatNumber(format, value, false) : '-'}
        </div>
    );
}

const defaultSorting = {
    name: monthList[monthList.length - 1],
    direction: 'Descending' as TableSortDirection,
};

interface Props {
    className?: string;

    indicatorId: string;
    regionId: string | undefined;
    outbreakId: string | undefined;
    subvariableId: string | undefined;
}

function OverviewTable(props: Props) {
    const {
        className,

        indicatorId,
        regionId,
        outbreakId,
        subvariableId,
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>('');

    const sortState = useSortState(defaultSorting);
    const { sorting } = sortState;
    const validSorting = sorting ?? defaultSorting;

    const tableVariables = useMemo((): TableValuesQueryVariables => ({
        indicatorId,
        emergency: outbreakId,
        region: regionId,
        subvariable: subvariableId,
    }), [
        indicatorId,
        regionId,
        outbreakId,
        subvariableId,
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

    const colorRange = useMemo(() => {
        const sortedValues = tableValues
            ?.overviewTable
            .map((country) => country.data)
            .flat()
            .map((data) => data.indicatorValue)
            .sort((a, b) => compareNumber(a, b, -1)) ?? [];

        let largestValue = sortedValues[0];
        if (isNotDefined(largestValue) || largestValue === 0) {
            largestValue = 1;
        }

        return colors.map((color, index) => (
            {
                minValue: (largestValue / colors.length) * index,
                maxValue: (largestValue / colors.length) * (index + 1),
                color,
            }));
    }, [tableValues]);

    const sortedData = useMemo((): TableData[] => {
        const transformedTableData = tableValues
            ?.overviewTable
            ?.map((item) => ({
                ...item,
                format: (item.data[0].format as FormatType | undefined) ?? 'raw',
                data: item.data.reduce<{ [key: string]: number }>(
                    (acc, curr) => ({
                        ...acc,
                        [curr.month]: curr.indicatorValue,
                    }),
                    {},
                ),
            }));

        const filteredData = rankedSearchOnList(
            transformedTableData ?? [],
            searchText,
            (item) => item.countryName,
        );

        const sortingKey = validSorting?.name;

        if (!sortingKey) {
            return filteredData;
        }

        return [...filteredData].sort((a, b) => compareNumber(
            a.data[sortingKey] ?? 0,
            b.data[sortingKey] ?? 0,
            validSorting.direction === 'Ascending' ? 1 : -1,
        ));
    }, [tableValues, validSorting, searchText]);

    const columns = useMemo(
        () => {
            // eslint-disable-next-line max-len
            const searchColumn: TableColumn<TableData, string, CountryListCellProps, CountryListHeaderCellProps> = {
                id: 'search',
                title: '',
                headerCellRenderer: CountryListHeaderCell,
                headerCellRendererClassName: styles.countryListHeaderCell,
                headerCellRendererParams: {
                    searchText,
                    onSearchTextChange: setSearchText,
                },
                cellRenderer: CountryListCell,
                cellRendererParams: (_, datum) => ({
                    title: datum.countryName,
                }),
                columnWidth: 240,
            };

            return [
                searchColumn,
                ...monthList.map((date) => ({
                    id: date,
                    title: new Date(date).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
                    headerCellRenderer: TableHeaderCell,
                    headerCellRendererClassName: styles.countryColumnHeader,
                    headerCellRendererParams: {
                        sortable: true,
                    },
                    cellRenderer: IndicatorValue,
                    cellRendererParams: (_: unknown, datum: TableData) => (
                        {
                            value: datum.data[date],
                            format: datum.format,
                            colorRange,
                        }
                    ),
                    columnWidth: 92,
                })),
            ];
        },
        [searchText, colorRange],
    );

    return (
        <SortContext.Provider value={sortState}>
            <TableView
                className={_cs(className, styles.tableWrapper)}
                headerCellClassName={styles.headerRowStyle}
                overflowContainerClassName={styles.overflowContainer}
                cellClassName={styles.eachTableCell}
                columns={columns}
                keySelector={tableKeySelector}
                data={sortedData}
                errored={false}
                pending={tableValuesLoading}
                filtered={!!validSorting}
                pendingMessage="Loading..."
                emptyMessage="No data to show."
                filteredEmptyMessage="No data to show."
                messageShown
            />
        </SortContext.Provider>
    );
}

export default OverviewTable;
