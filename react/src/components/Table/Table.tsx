import React, { useCallback, useMemo, useState } from 'react';
import { BsFillCaretDownFill, BsFillCaretUpFill } from 'react-icons/bs';
import { useFilters, useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table';
import { VariantQueryResponseSchemaTableRow } from '../../types';
import { Button, Column, Typography } from '../index';
import { ColumnFilter } from './ColumnFilter';
import { GlobalFilter } from './GlobalFilters';
import {
    FilterIcon,
    Footer,
    Row,
    SkipToBeginning,
    SkipToEnd,
    TableFilters,
    TableStyled,
} from './Table.styles';

interface TableProps {
    variantData: VariantQueryResponseSchemaTableRow[];
}

const Table: React.FC<TableProps> = ({ variantData }) => {
    const [open, setOpen] = useState<Boolean>(false);
    const [group, setGroup] = useState([
        {
            name: 'core',
            visible: true,
            columns: [
                'alt',
                'chromosome',
                'end',
                'ref',
                'start',
                'source'
            ]
        },
        {
            name: 'variation_details',
            visible: true,
            columns: [
                'af',
                'rsId',
                'someFakeScore'
            ]
        },
        {
            name: 'case_details',
            visible: true,
            columns: [
                'datasetId',
                'dp',
                'ethnicity',
                'phenotypes',
                'sex',
                'zygosity'
            ]
        },
    ]);

    const isColumnVisible = useCallback(
        (id: string) => group.filter(g => g.columns.includes(id))[0].visible,
        [group]
    )

    const tableData = useMemo(() => variantData, [variantData]);
    const sortByArray = useMemo(
        () => [
            {
                id: 'ref',
                desc: false,
            },
        ],
        []
    );

    const columns = React.useMemo(
        () => [
            {
                accessor: 'chromosome',
                id: 'chromosome',
                Header: 'Chromosome',
            },
            {
                accessor: 'af',
                id: 'af',
                Header: 'AF',
            },
            {
                accessor: 'alt',
                id: 'alt',
                Header: 'Alt',
            },
            {
                accessor: 'ref' as any, // strange typing issue here that should be looked into as things settle down
                id: 'ref',
                Header: 'Ref',
            },
            {
                accessor: 'source',
                id: 'source',
                Header: 'Source',
            },
            {
                accessor: 'datasetId',
                id: 'datasetId',
                Header: 'Dataset ID',
            },
            {
                accessor: 'dp',
                id: 'dp',
                Header: 'DP',
            },
            {
                accessor: 'end',
                id: 'end',
                Header: 'End',
            },
            {
                accessor: 'ethnicity',
                id: 'ethnicity',
                Header: 'Ethnicity',
            },
            {
                accessor: 'phenotypes',
                id: 'phenotypes',
                Header: 'Phenotypes',
            },
            {
                accessor: 'rsId',
                id: 'rsId',
                Header: 'RSID',
            },
            {
                accessor: 'sex',
                id: 'sex',
                Header: 'Sex',
            },
            {
                accessor: 'someFakeScore',
                id: 'someFakeScore',
                Header: 'Some Fake Score',
            },
            {
                accessor: 'zygosity',
                id: 'zygosity',
                Header: 'Zygosity',
            },
        ],
        []
    );

    console.log('COLUMNS', columns)

    const tableInstance = useTable<VariantQueryResponseSchemaTableRow>(
        {
            columns,
            data: tableData,
            initialState: {
                sortBy: sortByArray,
                hiddenColumns: ['chromosome']
            },
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageOptions,
        gotoPage,
        pageCount,
        setPageSize,
        state,
        setFilter,
        setAllFilters,
        setGlobalFilter,
        prepareRow,
        allColumns,
        toggleHideColumn,
        setHiddenColumns,
        getToggleHideAllColumnsProps,
    } = tableInstance;

    const { filters, globalFilter, pageIndex, pageSize } = state;

    const handleGroupChange = (g: {name: string, visible: boolean, columns:string[]}) => {
        setGroup(prev => prev.map(e => {
            if (e.name === g.name) {
                e.columns.map(c => toggleHideColumn(c, g.visible))
                return {
                    name: e.name,
                    visible: !g.visible,
                    columns: e.columns
                }
            }
            else {
                return e;
            }
        }))
    }

    return (
        <>
            <div>
                {group.map((g, id) => (
                    <div key={id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={g.visible}
                                onChange={() => handleGroupChange(g)}
                            />
                            {g.name}
                        </label>
                    </div>

                ))}
            </div>
            <TableFilters>
                <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                <Button variant="secondary" onClick={() => setOpen(prev => !prev)}>
                    Advanced Filters <FilterIcon />
                </Button>
                <Button
                    disabled={filters.length > 0 ? false : true}
                    variant="secondary"
                    onClick={() => setAllFilters([])}
                >
                    Clear all filters
                </Button>
            </TableFilters>

            {open && (
                <TableFilters>
                    {columns.map((v, i) => (
                        <Column key={i}>
                            <Typography variant="subtitle" bold>
                                {v.Header}
                            </Typography>
                            <ColumnFilter filters={filters} setFilter={setFilter} columnId={v.id} />
                        </Column>
                    ))}
                </TableFilters>
            )}
            <TableStyled {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => {
                        // https://github.com/tannerlinsley/react-table/discussions/2647
                        const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                        return (
                            <Row key={key} {...restHeaderGroupProps}>
                                {headerGroup.headers.map(column => {
                                    const { key, ...restHeaderProps } = column.getHeaderProps(
                                        column.getSortByToggleProps()
                                    );
                                    return (
                                        <th key={key} {...restHeaderProps}>
                                            <span>
                                                {column.render('Header')}
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? (
                                                        <BsFillCaretUpFill />
                                                    ) : (
                                                        <BsFillCaretDownFill />
                                                    )
                                                ) : (
                                                    ''
                                                )}
                                            </span>
                                        </th>
                                    );
                                })}
                            </Row>
                        );
                    })}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.length > 0 ? (
                        page.map(row => {
                            prepareRow(row);
                            const { key, ...restRowProps } = row.getRowProps();
                            return (
                                <Row key={key} {...restRowProps}>
                                    {row.cells.map(cell => {
                                        const { key, ...restCellProps } = cell.getCellProps();
                                        return (
                                            <td key={key} {...restCellProps}>
                                                {cell.render('Cell')}
                                            </td>
                                        );
                                    })}
                                </Row>
                            );
                        })
                    ) : (
                        <Typography variant="p" error>
                            There are no records to display.
                        </Typography>
                    )}
                </tbody>
            </TableStyled>
            <Footer>
                <span>
                    <Typography variant="subtitle">Rows per page:</Typography>
                    <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                        {[10, 25, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                </span>
                <Typography variant="subtitle">
                    Page
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>
                </Typography>
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    <SkipToBeginning fontSize="small" />
                </button>
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    Previous
                </button>
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    Next
                </button>
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    <SkipToEnd fontSize="small" />
                </button>
            </Footer>
        </>
    );
};
export default Table;
