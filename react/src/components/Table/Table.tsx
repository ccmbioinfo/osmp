import React, { useMemo, useState } from 'react';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import { useFilters, useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table';
import { VariantQueryResponseSchemaTableRow } from '../../types';
import { Button, Column, Typography } from '../index';
import { ColumnFilter } from './ColumnFilter';
import { GlobalFilter } from './GlobalFilters';
import { Footer, Row, SkipToBeginning, SkipToEnd, TableFilters, TableStyled } from './Table.styles';

interface TableProps {
    variantData: VariantQueryResponseSchemaTableRow[];
}

const Table: React.FC<TableProps> = ({ variantData }) => {
    const [open, setOpen] = useState<Boolean>(false);
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
        ],
        []
    );

    const tableInstance = useTable<VariantQueryResponseSchemaTableRow>(
        {
            columns,
            data: tableData,
            initialState: {
                sortBy: sortByArray,
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
        setGlobalFilter,
        prepareRow,
    } = tableInstance;

    const { globalFilter, pageIndex, pageSize } = state;

    return (
        <>
            <TableFilters>
                <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                <Button variant="secondary" onClick={() => setOpen(prev => !prev)}>
                    Advanced Filters
                </Button>
            </TableFilters>

            {open && (
                <TableFilters>
                    {columns.map((v, i) => (
                        <Column key={i}>
                            <Typography variant="subtitle" bold>
                                {v.Header}
                            </Typography>
                            <ColumnFilter setFilter={setFilter} columnId={v.id} />
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
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? (
                                                        <ArrowDropUp color="action" />
                                                    ) : (
                                                        <ArrowDropDown color="action" />
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
