import React, { useMemo, useState } from 'react';
import {
    _cs,
    compareNumber,
    encodeDate,
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
import { FilterType } from '#views/Dashboard/Filters';
import styles from './styles.css';

const colors = [
    '#fff7fb',
    '#ece7f2',
    '#d0d1e6',
    '#a6bddb',
    '#74a9cf',
    '#3690c0',
    '#0570b0',
    '#045a8d',
    '#023858',
];

const getMonthList = () => {
    const latestMonth = new Date();

    const months = [];
    for (let i = 0; i < 12; i += 1) {
        latestMonth.setMonth(latestMonth.getMonth() - 1);
        latestMonth.setDate(1);

        months.push(encodeDate(latestMonth));
    }
    return months.reverse();
};

const monthList = getMonthList();

// type TableViewProps = NonNullable<TableValuesQuery['overviewTable']>[number];
interface TableViewProps {
    countryName: string;
    countryId: string;
    iso3: string;
    data: {
        [key: string]: number | undefined,
    };
    format?: FormatType;
}

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
                    format
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

function getTextColorForHex(inputHex: string) {
    const hexcolor = inputHex.replace('#', '');
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

interface ColorRange {
    minValue: number;
    maxValue: number;
    color: string;
}

interface IndicatorValueProps {
    className?: string;
    value?: number;
    colorRange?: ColorRange[];
    format?: FormatType;
}

function IndicatorValue(props: IndicatorValueProps) {
    const {
        className,
        colorRange,
        value,
        format,
    } = props;

    const color = useMemo(() => {
        if (!value) {
            return colors[0];
        }
        return colorRange?.find(
            (range) => value > range.minValue
                && value <= range.maxValue,
        )?.color;
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
                color: getTextColorForHex(color ?? colors[0]),
            }}
            title={`Value: ${value ? formatNumber(format as FormatType, value) : '-'}`}
        >
            {value ? formatNumber(format as FormatType, value) : '-'}
        </div>
    );
}

const defaultSorting = {
    name: monthList[11],
    direction: 'Descending' as TableSortDirection,
};

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

    const sortState = useSortState(defaultSorting);
    const { sorting } = sortState;
    const validSorting = sorting ?? defaultSorting;

    const tableVariables = useMemo((): TableValuesQueryVariables => ({
        indicatorId: filterValues?.indicator ?? 'new_cases_per_million',
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

    const colorRange = useMemo(() => {
        const largestValue = tableValues
            ?.overviewTable
            .map((country) => country.data)
            .flat()
            .sort((a, b) => compareNumber(
                a.indicatorValue,
                b.indicatorValue,
                -1,
            ))?.[0]?.indicatorValue;

        return colors.map((color, index) => (
            {
                minValue: ((largestValue ?? 1) / colors.length) * index,
                maxValue: ((largestValue ?? 1) / colors.length) * (index + 1),
                color,
            }));
    }, [tableValues?.overviewTable]);

    const sortedData = useMemo(() => {
        const transformedTableData = tableValues?.overviewTable?.map((item) => ({
            ...item,
            format: item.data[0].format as FormatType,
            data: item.data.reduce(
                (acc, curr) => ({
                    ...acc,
                    [curr.month]: curr.indicatorValue,
                }),
                {} as { [key: string]: number },
            ),
        }));

        const filteredData = rankedSearchOnList(
            transformedTableData ?? [],
            searchText,
            (item) => item.countryName,
        );

        if (!validSorting?.name) {
            return filteredData;
        }
        return [...filteredData].sort((a, b) => compareNumber(
            a.data[validSorting?.name],
            b.data[validSorting?.name],
            validSorting?.direction === 'Ascending' ? 1 : -1,
        ));
    }, [tableValues?.overviewTable, validSorting, searchText]);

    const columns = useMemo(
        () => {
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
                columnWidth: 240,
            };

            return [
                searchColumn,
                ...monthList.map(
                    (date) => (
                        {
                            id: date,
                            title: new Date(date).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
                            headerCellRenderer: TableHeaderCell,
                            headerCellRendererClassName: styles.countryColumnHeader,
                            headerCellRendererParams: {
                                sortable: true,
                            },
                            cellRenderer: IndicatorValue,
                            cellRendererParams: (_: unknown, datum: TableViewProps) => (
                                {
                                    value: datum.data[date],
                                    format: datum.format,
                                    colorRange,
                                }
                            ),
                            columnWidth: 92,
                        }
                    ),
                ),
            ];
        },
        [
            searchText,
            colorRange,
        ],
    );

    return (
        <SortContext.Provider value={sortState}>
            <TableView
                className={_cs(className, styles.tableWrapper)}
                headerCellClassName={styles.headerRowStyle}
                cellClassName={styles.eachTableCell}
                columns={columns}
                keySelector={tableKeySelector}
                data={sortedData}
                errored={false}
                pending={tableValuesLoading}
                filtered={false}
                pendingMessage="Loading..."
                emptyMessage="No data to show."
                messageShown
            />
        </SortContext.Provider>
    );
}

export default OverviewTable;
