import React, { useMemo, useState } from 'react';
import {
    BsFillCaretDownFill,
    BsFillCaretUpFill,
    BsFillEyeFill,
    BsFillEyeSlashFill,
} from 'react-icons/bs';
import { Row, useFilters, useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table';
import { downloadCsv } from '../../hooks';
import { IndividualResponseFields, TableRow, VariantQueryDataResult } from '../../types';
import { Button, InlineFlex, Modal, Typography } from '../index';
import { Column, Flex } from '../Layout';
import { ColumnFilter } from './ColumnFilter';
import { GlobalFilter } from './GlobalFilters';
import {
    FilterIcon,
    Footer,
    RowStyled,
    SkipToBeginning,
    SkipToEnd,
    TableFilters,
    TableStyled,
} from './Table.styles';

interface TableProps {
    variantData: VariantQueryDataResult[];
}

type TableKeys = keyof TableRow;

/* flatten calls, will eventually need to make sure call.individualId is reliably mapped to individualId on variant */
const prepareData = (queryResult: VariantQueryDataResult[]): TableRow[] => {
    const results = [] as TableRow[];
    queryResult.forEach(r => {
        const source = r.source;
        r.data.forEach(d => {
            const { callsets, ...rest } = d.variant;
            if (callsets.length) {
                callsets.forEach(cs => {
                    results.push({ ...cs.info, ...rest, ...d.individual, source, contact: '' });
                });
            } else {
                results.push({ ...rest, ...d.individual, source });
            }
        });
    });
    return results;
};

const Table: React.FC<TableProps> = ({ variantData }) => {
    const [open, setOpen] = useState<Boolean>(false);
    const [showModal, setShowModal] = useState<Boolean>(false);
    const [group, setGroup] = useState([
        {
            name: 'Core',
            visible: true,
            columns: ['alt', 'chromosome', 'end', 'ref', 'start', 'source'],
        },
        {
            name: 'Variation Details',
            visible: true,
            columns: ['af', 'rsId', 'someFakeScore'],
        },
        {
            name: 'Case Details',
            visible: true,
            columns: ['datasetId', 'dp', 'ethnicity', 'phenotypes', 'sex', 'zygosity'],
        },
    ]);

    const tableData = useMemo(() => prepareData(variantData), [variantData]);
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
                Header: 'Core',
                id: 'core',
                columns: [
                    {
                        accessor: 'refseqId',
                        id: 'chromosome',
                        Header: 'Chromosome',
                    },
                    {
                        accessor: 'alt',
                        id: 'alt',
                        Header: 'Alt',
                    },
                    {
                        accessor: 'ref',
                        id: 'ref',
                        Header: 'Ref',
                    },
                    {
                        accessor: 'start',
                        id: 'start',
                        Header: 'Start',
                    },
                    {
                        accessor: 'end',
                        id: 'end',
                        Header: 'End',
                    },
                    {
                        accessor: 'source',
                        id: 'source',
                        Header: 'Source',
                    },
                ],
            },
            {
                Header: 'Variation Details',
                id: 'variation_details',
                columns: [
                    {
                        accessor: 'af',
                        id: 'af',
                        Header: 'AF',
                    },
                ],
            },
            {
                Header: 'Case Details',
                id: 'case_details',
                columns: [
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
                        accessor: 'ethnicity',
                        id: 'ethnicity',
                        Header: 'Ethnicity',
                    },
                    {
                        accessor: (state: any) =>
                            (state.phenotypicFeatures || [])
                                .map((p: any) => p.phenotypeId)
                                .join(', '),
                        id: 'phenotypes',
                        Header: 'Phenotypes',
                    },

                    {
                        accessor: 'sex',
                        id: 'sex',
                        Header: 'Sex',
                    },

                    {
                        accessor: 'zygosity',
                        id: 'zygosity',
                        Header: 'Zygosity',
                    },
                    {
                        accessor: () => (
                            <Flex justifyContent="center">
                                <Button variant="primary">Contact</Button>
                            </Flex>
                        ),
                        id: 'contact',
                        Header: 'Contact',
                    },
                ],
            },
        ],
        []
    );

    const tableInstance = useTable<TableRow>(
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
        setAllFilters,
        setGlobalFilter,
        prepareRow,
        toggleHideColumn,
        visibleColumns,
        rows,
    } = tableInstance;

    const { filters, globalFilter, pageIndex, pageSize } = state;

    /**
     * The downloadCsv function takes in a JSON array for the csv export.
     * However, the contact column contains a button instead of a string.
     * The formatDataForCsv takes all visible row data that has been materialized on react-table
     * and replaces the contact button with the original email string.
     */
    const formatDataForCsv = (rows: Row<TableRow>[]) => {
        return rows.map(r => {
            return { ...r.values, contact: (r.original as IndividualResponseFields).contactEmail };
        });
    };

    const handleGroupChange = (g: { name: string; visible: boolean; columns: string[] }) => {
        setGroup(prev =>
            prev.map(e => {
                if (e.name === g.name) {
                    e.columns.map(c => toggleHideColumn(c, g.visible));
                    return {
                        name: e.name,
                        visible: !g.visible,
                        columns: e.columns,
                    };
                } else {
                    return e;
                }
            })
        );
    };

    return (
        <>
            <TableFilters>
                <InlineFlex>
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
                </InlineFlex>
                <InlineFlex>
                    <Button variant="secondary" onClick={() => setShowModal(!showModal)}>
                        {showModal ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            downloadCsv(
                                formatDataForCsv(rows),
                                visibleColumns.map(c => c.id) as TableKeys
                            )
                        }
                    >
                        Export Data
                    </Button>
                    <Modal
                        active={showModal}
                        hideModal={() => setShowModal(false)}
                        title="Hide/Unhide Columns"
                    >
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
                    </Modal>
                </InlineFlex>
            </TableFilters>

            {open && (
                <TableFilters justifyContent="flex-start" alignItems="flex-start">
                    {columns
                        .map(c => c.columns)
                        .flat()
                        .map((v, i) => (
                            <Column key={i}>
                                <Typography variant="subtitle" bold>
                                    {v.Header}
                                </Typography>
                                <ColumnFilter
                                    filters={filters}
                                    setFilter={setFilter}
                                    columnId={v.id}
                                />
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
                            <RowStyled key={key} {...restHeaderGroupProps}>
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
                            </RowStyled>
                        );
                    })}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.length > 0 ? (
                        page.map(row => {
                            prepareRow(row);
                            const { key, ...restRowProps } = row.getRowProps();
                            return (
                                <RowStyled key={key} {...restRowProps}>
                                    {row.cells.map(cell => {
                                        const { key, ...restCellProps } = cell.getCellProps();
                                        return (
                                            <td key={key} {...restCellProps}>
                                                {cell.render('Cell')}
                                            </td>
                                        );
                                    })}
                                </RowStyled>
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
