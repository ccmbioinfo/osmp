import React, { useMemo } from 'react';
import { ArrowDropDown, ArrowDropUp } from '@material-ui/icons';
import { usePagination, useSortBy, useTable } from 'react-table';
import { VariantQueryResponseSchemaTableRow } from '../../types';
import { Typography } from '../index';
import { Footer, Row, SkipToBeginning, SkipToEnd, TableStyled } from './Table.styles';

interface TableProps {
    variantData: VariantQueryResponseSchemaTableRow[];
}

const Table: React.FC<TableProps> = ({ variantData }) => {
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
        prepareRow,
    } = tableInstance;

    const { pageIndex, pageSize } = state;

    return (
        <>
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
                    {page.map(row => {
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
                    })}
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
