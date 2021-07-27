import React, { useMemo } from 'react';
import { useTable } from 'react-table';
import { VariantQueryResponseSchemaTableRow } from '../../types';
import { Row, TableStyled } from './TableStyled';

interface TableProps {
    variantData: VariantQueryResponseSchemaTableRow[];
}

const Table: React.FC<TableProps> = ({ variantData }) => {
    const tableData = useMemo(() => variantData, [variantData]);

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

    const tableInstance = useTable<VariantQueryResponseSchemaTableRow>({
        columns,
        data: tableData,
    });

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

    return (
        <TableStyled {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => {
                    // https://github.com/tannerlinsley/react-table/discussions/2647
                    const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                        <Row key={key} {...restHeaderGroupProps}>
                            {headerGroup.headers.map(column => {
                                const { key, ...restHeaderProps } = column.getHeaderProps();
                                return (
                                    <th key={key} {...restHeaderProps}>
                                        {column.render('Header')}
                                    </th>
                                );
                            })}
                        </Row>
                    );
                })}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
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
    );
};
export default Table;
