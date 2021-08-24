import React, { useMemo, useState } from 'react';
import {
    BsFillCaretDownFill,
    BsFillCaretUpFill,
    BsFillEyeFill,
    BsFillEyeSlashFill,
    BsFilter,
} from 'react-icons/bs';
import { CgArrowsMergeAltH, CgArrowsShrinkH } from 'react-icons/cg';
import {
    HeaderGroup,
    Row,
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    usePagination,
    useSortBy,
    useTable,
} from 'react-table';
import { downloadCsv } from '../../hooks';
import { IndividualResponseFields, TableRow, VariantQueryDataResult } from '../../types';
import { Button, Checkbox, Column, Flex, InlineFlex, Modal, Typography } from '../index';
import { ColumnFilter } from './ColumnFilter';
import { GlobalFilter } from './GlobalFilters';
import {
    Footer,
    IconPadder,
    SkipToBeginning,
    SkipToEnd,
    Styles,
    TableFilters,
    TH,
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

    /**
     * The way react-table is set up is if all columns are hidden, the header group will disappear.
     * This is undesired because user may want to re-expand the column.
     * The workaround for this is to keep some columns with fixed visibility.
     */
    const fixedColumns = React.useMemo(
        () => ['core', 'chromosome', 'refseqId', 'alt', 'ref', 'start', 'end', 'source'],
        []
    );

    const dummyColumns = React.useMemo(() => ['empty_variation_details', 'empty_case_details'], []);


    type Accessor = string | (() => JSX.Element) | ((state: any) => any);
    // Dynamically adjust column width based on cell's longest text.
    const getColumnWidth = React.useCallback((data: TableRow[], accessor: Accessor, headerText: string) => {
        if (typeof accessor === 'string') {
          accessor = d => d[accessor as string]; // eslint-disable-line no-param-reassign
        }
        const maxWidth = 600;
        const magicSpacing = 10;
        const cellLength = Math.max(
          ...data.map(row => (`${(accessor as (state: any) => any)(row)}` || '').length),
          headerText.length,
        );
        return Math.min(maxWidth, cellLength * magicSpacing);
      }, [])
    
    

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
                        width: 90,
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
                        width: 80,
                    },
                    {
                        accessor: 'end',
                        id: 'end',
                        Header: 'End',
                        width: 80,
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
                        accessor: '',
                        id: 'empty_variation_details',
                        Header: '',
                        disableSortBy: true,
                        width: 70,
                        maxWidth: 160,
                    },
                    {
                        accessor: 'af',
                        id: 'af',
                        Header: 'AF',
                        width: 150,
                    },
                ],
            },
            {
                Header: 'Case Details',
                id: 'case_details',
                columns: [
                    {
                        accessor: '',
                        id: 'empty_case_details',
                        Header: '',
                        disableSortBy: true,
                        width: getColumnWidth(tableData, '', '')
                    },
                    {
                        accessor: 'datasetId',
                        id: 'datasetId',
                        Header: 'Dataset ID',
                        width: 80,
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
                        width: 90,
                    },
                    {
                        accessor: (state: any) =>
                            (state.phenotypicFeatures || [])
                                .map((p: any) => p.phenotypeId)
                                .join(', '),
                        id: 'phenotypes',
                        Header: 'Phenotypes',
                        width: 250,
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
                        width: 90,
                    },
                    {
                        accessor: () => (
                            <Flex justifyContent="center">
                                <Button variant="primary">Contact</Button>
                            </Flex>
                        ),
                        id: 'contact',
                        Header: 'Contact',
                        width: 100,
                    },
                ],
            },
        ],
        [getColumnWidth, tableData]
    );

    const defaultColumn = React.useMemo(
        () => ({
            minWidth: 30,
            width: 60,
            maxWidth: 300,
        }),
        []
    );

    const tableInstance = useTable<TableRow>(
        {
            columns,
            defaultColumn,
            data: tableData,
            initialState: {
                sortBy: sortByArray,
                hiddenColumns: dummyColumns,
            },
        },
        useFilters,
        useFlexLayout,
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

    const handleGroupChange = (g: HeaderGroup<TableRow>) =>
        g.columns?.map(c => !fixedColumns.includes(c.id) && toggleHideColumn(c.id, c.isVisible));

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

    return (
        <>
            <TableFilters justifyContent="space-between">
                <InlineFlex>
                    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                    <Button variant="secondary" onClick={() => setOpen(prev => !prev)}>
                        Advanced Filters{' '}
                        <IconPadder>
                            <BsFilter />
                        </IconPadder>
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
                        Customize columns
                        <IconPadder>
                            {showModal ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
                        </IconPadder>
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
                        title="Customize Columns"
                    >
                        {headerGroups[0].headers.map((g, id) => (
                            <div key={id}>
                                <Checkbox
                                    label={g.Header as string}
                                    checked={g.isVisible}
                                    onClick={() => handleGroupChange(g)}
                                />
                                {g.columns?.map(
                                    (c, id) =>
                                        !fixedColumns.includes(c.id) &&
                                        !dummyColumns.includes(c.id) && (
                                            <div key={id} style={{ paddingLeft: 20 }}>
                                                <Checkbox
                                                    label={c.Header as string}
                                                    checked={c.isVisible}
                                                    onClick={() => {
                                                        if (
                                                            c.parent &&
                                                            g.columns?.filter(c => c.isVisible)
                                                                .length === 1
                                                        ) {
                                                            toggleHideColumn(c.id, c.isVisible);
                                                            toggleHideColumn(
                                                                'empty_' + c.parent.id,
                                                                !c.isVisible
                                                            );
                                                        } else {
                                                            toggleHideColumn(c.id, c.isVisible);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )
                                )}
                            </div>
                        ))}
                    </Modal>
                </InlineFlex>
            </TableFilters>

            {open && (
                <TableFilters justifyContent="flex-start" alignItems="flex-start">
                    {columns
                        .map(c => c.columns)
                        .flat()
                        .filter(c => !dummyColumns.includes(c.id))
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

            <Styles>
                <table {...getTableProps()}>
                    <thead>
                        {headerGroups.map(headerGroup => {
                            // https://github.com/tannerlinsley/react-table/discussions/2647
                            const { key, ...restHeaderGroupProps } =
                                headerGroup.getHeaderGroupProps();
                            return (
                                <tr key={key} {...restHeaderGroupProps}>
                                    {headerGroup.headers.map(column => {
                                        const { key, ...restHeaderProps } = column.getHeaderProps(
                                            column.getSortByToggleProps()
                                        );
                                        return (
                                            <TH variant="pureCssAnimation" key={key} {...restHeaderProps}>
                                                <span>
                                                    {column.render('Header')}
                                                    {!column.parent &&
                                                        column.columns &&
                                                        column.Header !== 'Core' &&
                                                        (column.columns.filter(c => c.isVisible)
                                                            .length ===
                                                        columns.filter(
                                                            c => c.Header === column.Header
                                                        )[0].columns.length ? (
                                                            <IconPadder>
                                                                <CgArrowsMergeAltH
                                                                    onClick={() =>
                                                                        handleGroupChange(column)
                                                                    }
                                                                />
                                                            </IconPadder>
                                                        ) : (
                                                            <IconPadder>
                                                                <CgArrowsShrinkH
                                                                    onClick={() =>
                                                                        handleGroupChange(column)
                                                                    }
                                                                />
                                                            </IconPadder>
                                                        ))}
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
                                            </TH>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.length > 0 ? (
                            page.map(row => {
                                prepareRow(row);
                                const { key, ...restRowProps } = row.getRowProps();
                                return (
                                    <tr key={key} {...restRowProps}>
                                        {row.cells.map(cell => {
                                            const { key, ...restCellProps } = cell.getCellProps();
                                            return (
                                                <td key={key} {...restCellProps}>
                                                    {cell.render('Cell')}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        ) : (
                            <Typography variant="p" error>
                                There are no records to display.
                            </Typography>
                        )}
                    </tbody>
                </table>
            </Styles>
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
