import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BsFillCaretDownFill,
    BsFillCaretUpFill,
    BsFillEyeFill,
    BsFillEyeSlashFill,
    BsFilter,
} from 'react-icons/bs';
import { CgArrowsMergeAltH, CgArrowsShrinkH } from 'react-icons/cg';
import ScrollContainer from 'react-indiana-drag-scroll';
import {
    ColumnGroup,
    HeaderGroup,
    Row,
    useExpanded,
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    usePagination,
    useSortBy,
    useTable,
} from 'react-table';
import './dragscroll.css';
import HEADERS from '../../constants/headers';
import SOURCES from '../../constants/sources';
import { downloadCsv, useOverflow } from '../../hooks';
import {
    CallsetInfoFields,
    IndividualInfoFields,
    IndividualResponseFields,
    VariantQueryDataResult,
    VariantResponseFields,
    VariantResponseInfoFields,
} from '../../types';
import { Button, Checkbox, Column, Flex, InlineFlex, Modal, Tooltip, Typography } from '../index';
import { CellPopover } from './CellPopover';
import './dragscroll.css';
import PhenotypeViewer from './PhenotypeViewer';
import {
    CellText,
    Footer,
    IconPadder,
    SkipToBeginning,
    SkipToEnd,
    Styles,
    TableFilters,
    TH,
    THead,
} from './Table.styles';
import { ColumnFilter } from './TableFilter/ColumnFilter';
import { GlobalFilter } from './TableFilter/GlobalFilters';

interface TableProps {
    variantData: VariantQueryDataResult[];
}

export type FlattenedQueryResponse = Omit<
    IndividualResponseFields,
    'info' | 'diseases' | 'phenotypicFeatures'
> &
    IndividualInfoFields & { contactInfo: string } & Omit<
        VariantResponseFields,
        'callsets' | 'info'
    > &
    CallsetInfoFields &
    VariantResponseInfoFields & { source: string; phenotypes: string; diseases: string };

/* flatten all but callsets field */
const flattenBaseResults = (result: VariantQueryDataResult): FlattenedQueryResponse => {
    const { contactInfo, source } = result;
    const { callsets, info: variantInfo, ...restVariant } = result.variant;
    const {
        diseases,
        info: individualInfo,
        phenotypicFeatures,
        ...restIndividual
    } = result.individual;
    const flattenedDiseases = (diseases || []).reduce(
        (a, c, i) => `${a}${i ? ';' : ''}${c.diseaseId}: ${c.description}`,
        ''
    );
    const flattenedPhenotypes = (phenotypicFeatures || []).reduce(
        (a, c, i) => `${a}${i ? ';' : ''}${c.phenotypeId}: ${c.levelSeverity}`,
        ''
    );

    return {
        contactInfo,
        diseases: flattenedDiseases,
        ...individualInfo,
        phenotypes: flattenedPhenotypes,
        ...restIndividual,
        ...restVariant,
        source,
        ...variantInfo,
    };
};
export interface ResultTableColumns extends FlattenedQueryResponse {
    aaChange: string;
    emptyCaseDetails: string;
    emptyVariationDetails: string;
}

const addAdditionalFieldsAndFormatNulls = (results: FlattenedQueryResponse): ResultTableColumns => {
    const reformatted = Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, v === 'NA' ? '' : v])
    ) as FlattenedQueryResponse;
    return {
        ...reformatted,
        emptyCaseDetails: '',
        emptyVariationDetails: '',
        aaChange: reformatted.aaPos?.trim()
            ? `p.${reformatted.aaRef}${reformatted.aaPos}${reformatted.aaAlt}`
            : '',
    };
};

/* flatten data and compute values as needed (note that column display formatting function should not alter values for ease of export) */
const prepareData = (queryResult: VariantQueryDataResult[]): ResultTableColumns[] => {
    return queryResult.flatMap(d => {
        if (d.variant.callsets.length) {
            //one row per individual per callset
            return d.variant.callsets
                .filter(cs => cs.individualId === d.individual.individualId)
                .map(cs =>
                    addAdditionalFieldsAndFormatNulls({
                        ...cs.info,
                        ...flattenBaseResults(d),
                    })
                );
        } else {
            return addAdditionalFieldsAndFormatNulls(flattenBaseResults(d));
        }
    });
};

const FILTER_OPTIONS: { [K in keyof ResultTableColumns]?: string[] } = {
    source: SOURCES,
};

const Table: React.FC<TableProps> = ({ variantData }) => {
    const [advancedFiltersOpen, setadvancedFiltersOpen] = useState<Boolean>(false);
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
        () => ['core', 'chromosome', 'referenceName', 'alt', 'ref', 'start', 'end', 'source'],
        []
    );

    const dummyColumns = React.useMemo(() => ['emptyVariationDetails', 'emptyCaseDetails'], []);

    const columnsWithoutFilters = React.useMemo(() => ['contactInfo', 'chromosome'], []);

    const filterTypes = React.useMemo(
        () => ({
            multiSelect: (
                rows: Row<ResultTableColumns>[],
                columnIds: string[],
                filterValue: string[]
            ) =>
                filterValue.length
                    ? rows.filter(row => filterValue.includes(row.values[columnIds[0]]))
                    : rows,
        }),
        []
    );

    type Accessor = string | (() => JSX.Element) | ((state: any) => any);

    // Dynamically adjust column width based on cell's longest text.
    const getColumnWidth = React.useCallback(
        (data: ResultTableColumns[], accessor: Accessor, headerText: string) => {
            if (typeof accessor === 'string') {
                accessor = d => d[accessor as string]; // eslint-disable-line no-param-reassign
            }
            const maxWidth = 600;
            const magicSpacing = 10;
            const cellLength = Math.max(
                ...data.map(row => (`${(accessor as (state: any) => any)(row)}` || '').length),
                headerText.length
            );
            return Math.min(maxWidth, cellLength * magicSpacing);
        },
        []
    );

    const columns = React.useMemo(
        (): ColumnGroup<ResultTableColumns>[] => [
            {
                Header: 'Core',
                id: 'core',
                columns: [
                    {
                        accessor: state => state.referenceName,
                        id: 'chromosome',
                        Header: 'Chromosome',
                        width: getColumnWidth(tableData, 'referenceName', 'Chromosome'),
                    },
                    {
                        accessor: 'start',
                        id: 'start',
                        Header: 'Start',
                        width: getColumnWidth(tableData, 'start', 'Start'),
                        filter: 'between',
                    },
                    {
                        accessor: 'end',
                        id: 'end',
                        Header: 'End',
                        width: getColumnWidth(tableData, 'end', 'End'),
                        filter: 'between',
                    },
                    {
                        accessor: 'ref',
                        Cell: ({ row }) => <CellPopover state={row.original} id="ref" />,
                        id: 'ref',
                        Header: 'Ref',
                        width: getColumnWidth(tableData, 'referenceName', 'Chromosome'),
                    },
                    {
                        accessor: 'alt',
                        Cell: ({ row }) => <CellPopover state={row.original} id="alt" />,
                        id: 'alt',
                        Header: 'Alt',
                        width: getColumnWidth(tableData, 'alt', 'Alt'),
                    },
                    {
                        accessor: 'source',
                        filter: 'singleSelect',
                        id: 'source',
                        Header: <Tooltip helperText={HEADERS['source']}>Source</Tooltip>,
                        width: getColumnWidth(tableData, 'source', 'Source'),
                    },
                ],
            },
            {
                Header: 'Variation Details',
                id: 'variation_details',
                columns: [
                    {
                        id: 'emptyVariationDetails',
                        Header: '',
                        disableSortBy: true,
                        width: 79,
                    },
                    {
                        accessor: 'af',
                        id: 'af',
                        Header: <Tooltip helperText={HEADERS['af']}>gnomad_exome_AF</Tooltip>,
                        width: 110,
                        filter: 'between',
                    },
                    {
                        id: 'aaChange',
                        accessor: 'aaChange',
                        Header: 'aaChange',
                        width: 105,
                    },
                    { accessor: 'cdna', id: 'cdna', Header: 'cdna', width: 105 },
                    {
                        accessor: 'consequence',
                        id: 'consequence',
                        Header: 'consequence',
                        width: 105,
                        filter: 'multiSelect',
                    },
                    /* { accessor: 'gnomadHet', id: 'gnomadHet', Header: 'gnomadHet', width: 105 }, */
                    {
                        accessor: 'gnomadHom',
                        id: 'gnomadHom',
                        Header: 'gnomadHom',
                        width: 105,
                        filter: 'between',
                    },
                    { accessor: 'transcript', id: 'transcript', Header: 'transcript', width: 150 },
                ],
            },
            {
                Header: 'Case Details',
                id: 'case_details',
                columns: [
                    {
                        id: 'emptyCaseDetails',
                        Header: '',
                        disableSortBy: true,
                        width: 70,
                    },
                    {
                        accessor: 'datasetId',
                        id: 'datasetId',
                        Header: 'Dataset ID',
                        width: getColumnWidth(tableData, 'datasetId', 'Dataset ID'),
                    },
                    {
                        accessor: 'dp',
                        id: 'dp',
                        Header: 'DP',
                        width: getColumnWidth(tableData, 'dp', 'DP'),
                    },
                    {
                        accessor: 'ad',
                        id: 'ad',
                        Header: 'AD',
                        width: getColumnWidth(tableData, 'ad', 'AD'),
                    },
                    {
                        accessor: 'gq',
                        id: 'gq',
                        Header: 'GQ',
                        width: getColumnWidth(tableData, 'gq', 'GQ'),
                    },
                    {
                        accessor: 'ethnicity',
                        id: 'ethnicity',
                        Header: <Tooltip helperText={HEADERS['ethnicity']}>Ethnicity</Tooltip>,
                        width: getColumnWidth(tableData, 'ethnicity', 'Ethnicity'),
                    },
                    {
                        accessor: 'phenotypes',
                        id: 'phenotypes',
                        Cell: ({ cell: { row } }) => (
                            <PhenotypeViewer
                                phenotypes={row.original.phenotypes}
                                expanded={row.isExpanded}
                                onClick={() => row.toggleRowExpanded(!row.isExpanded)}
                            ></PhenotypeViewer>
                        ),
                        Header: 'Phenotypes',
                        width: getColumnWidth(
                            tableData,
                            state =>
                                (state.phenotypicFeatures || [])
                                    .map((p: any) => p.phenotypeId)
                                    .join(', '),
                            'Phenotypes'
                        ),
                    },
                    {
                        accessor: 'sex',
                        filter: 'multiSelect',
                        id: 'sex',
                        Header: <Tooltip helperText={HEADERS['sex']}>Sex</Tooltip>,
                        width: getColumnWidth(tableData, 'sex', 'Sex'),
                        Cell: ({ cell: { value } }) => <>{value ? value : 'NA'}</>,
                    },
                    {
                        accessor: 'zygosity',
                        filter: 'multiSelect',
                        id: 'zygosity',
                        Header: 'Zygosity',
                        width: getColumnWidth(tableData, 'zygosity', 'Zygosity'),
                    },
                    {
                        accessor: 'geographicOrigin',
                        id: 'geographicOrigin',
                        Header: (
                            <Tooltip helperText={HEADERS['geographicOrigin']}>
                                Geographic Origin
                            </Tooltip>
                        ),
                        width: getColumnWidth(tableData, 'geographicOrigin', 'Geographic Origin'),
                    },
                    {
                        accessor: 'candidateGene',
                        id: 'candidateGene',
                        Header: 'Candidate Gene',
                        width: getColumnWidth(tableData, 'candidateGene', 'Candidate Gene'),
                    },
                    {
                        accessor: 'classifications',
                        id: 'classifications',
                        Header: 'Classifications',
                        width: getColumnWidth(tableData, 'classifications', 'Classifications'),
                    },
                    {
                        accessor: 'diseases',
                        id: 'diseases',
                        Header: <Tooltip helperText={HEADERS['diseases']}>Diseases</Tooltip>,
                        width: getColumnWidth(tableData, 'diseases', 'Diseases'),
                    },
                    {
                        accessor: 'diagnosis',
                        id: 'diagnosis',
                        Header: 'Diagnosis',
                        width: getColumnWidth(tableData, 'diagnosis', 'Diagnosis'),
                    },
                    {
                        accessor: 'contactInfo',
                        Cell: ({ row }) => <CellPopover state={row.original} id="contactInfo" />,
                        id: 'contactInfo',
                        Header: <Tooltip helperText={HEADERS['contactInfo']}>Contact</Tooltip>,
                        width: 120,
                    },
                ],
            },
        ],
        [getColumnWidth, tableData]
    );

    const defaultColumn = React.useMemo(
        () => ({
            minWidth: 10,
            width: 60,
            maxWidth: 300,
        }),
        []
    );

    const getChildColumns = (groupId: string) => {
        const targetGroup = columns.find(header => header.id === groupId);
        if (targetGroup) {
            return targetGroup.columns
                .map(c => c.id)
                .filter(id => id && !dummyColumns.includes(id)) as string[];
        } else throw new Error(`Group ${groupId} not found!`);
    };

    const tableInstance = useTable(
        {
            columns,
            defaultColumn,
            data: tableData,
            filterTypes,
            initialState: {
                sortBy: sortByArray,
                hiddenColumns: [
                    getChildColumns('case_details'),
                    getChildColumns('variation_details'),
                ].flat(),
            },
        },
        useFilters,
        useFlexLayout,
        useGlobalFilter,
        useSortBy,
        useExpanded,
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
        preFilteredRows,
        toggleHideColumn,
        visibleColumns,
        rows,
    } = tableInstance;

    const { filters, globalFilter, pageIndex, pageSize } = state;

    const horizontalRef = React.useRef(null);
    const verticalRef = React.useRef(null);
    const { refXOverflowing } = useOverflow(horizontalRef);
    const { refYOverflowing, refYScrollBegin, refYScrollEnd, isScrolling } =
        useOverflow(verticalRef);

    const handleGroupChange = (g: HeaderGroup<ResultTableColumns>) =>
        g.columns?.map(c => !fixedColumns.includes(c.id) && toggleHideColumn(c.id, c.isVisible));

    const isHeader = (column: HeaderGroup<ResultTableColumns>) => !column.parent;

    const isHeaderExpanded = (column: HeaderGroup<ResultTableColumns>) => {
        if (isHeader(column) && column.columns && column.Header !== 'Core') {
            const visibleColumns = column.columns.filter(c => c.isVisible).map(c => c.id);
            const intersection = visibleColumns.filter(value => dummyColumns.includes(value));
            return !intersection.length;
        }
        return false;
    };

    return (
        <>
            <TableFilters justifyContent="space-between">
                <InlineFlex>
                    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                    <Button
                        variant="secondary"
                        onClick={() => setadvancedFiltersOpen(prev => !prev)}
                    >
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
                                rows.map(r => r.values as ResultTableColumns),
                                visibleColumns
                                    .filter(c => c.id && !c.id.match(/^empty/i))
                                    .map(c => c.id as keyof ResultTableColumns)
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
                        {headerGroups[0].headers
                            .filter(header => header.Header !== 'Core')
                            .map((g, id) => (
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
                                                                    'empty' + c.parent.id,
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

            {advancedFiltersOpen && (
                <TableFilters justifyContent="flex-start" alignItems="flex-start">
                    {columns
                        .flatMap(c => c.columns)
                        .sort((a, b) => ((a.id || 0) > (b.id || 0) ? 1 : -1))
                        .filter(
                            c =>
                                !!c.id && !dummyColumns.concat(columnsWithoutFilters).includes(c.id)
                        )
                        .map((v, i) => (
                            <Column key={i}>
                                <Typography variant="subtitle" bold>
                                    {v.Header}
                                </Typography>
                                <ColumnFilter
                                    preFilteredRows={preFilteredRows}
                                    filterModel={filters.find(f => f.id === v.id)}
                                    options={
                                        !!(
                                            !!v.id &&
                                            !!FILTER_OPTIONS[v.id as keyof ResultTableColumns]
                                        )
                                            ? FILTER_OPTIONS[v.id as keyof ResultTableColumns]
                                            : undefined
                                    }
                                    setFilter={setFilter.bind(null, v.id as string)}
                                    type={v.filter as 'text' | 'multiSelect' | 'singleSelect'}
                                    columnId={v.id as keyof ResultTableColumns}
                                />
                            </Column>
                        ))}
                </TableFilters>
            )}

            <Styles>
                {/* If not overflowing, top scrollbar is not shown.  */}
                <ScrollContainer
                    className="container"
                    hideScrollbars={!refXOverflowing}
                    ignoreElements="p"
                >
                    <table {...getTableProps()} ref={horizontalRef}>
                        <THead>
                            {headerGroups.map(headerGroup => {
                                // https://github.com/tannerlinsley/react-table/discussions/2647
                                const { key, ...restHeaderGroupProps } =
                                    headerGroup.getHeaderGroupProps();
                                return (
                                    <motion.tr layout key={key} {...restHeaderGroupProps}>
                                        {headerGroup.headers.map(column => {
                                            const { key, ...restHeaderProps } =
                                                column.getHeaderProps(
                                                    column.getSortByToggleProps({
                                                        title: undefined,
                                                    })
                                                );
                                            return (
                                                <TH key={key} {...restHeaderProps}>
                                                    <AnimatePresence initial={false}>
                                                        {column.isVisible && (
                                                            <motion.section
                                                                key="content"
                                                                initial="collapsed"
                                                                animate="advancedFiltersOpen"
                                                                exit="collapsed"
                                                                variants={{
                                                                    advancedFiltersOpen: {
                                                                        opacity: 1,
                                                                        width: 'auto',
                                                                    },
                                                                    collapsed: {
                                                                        opacity: 0,
                                                                        width: 0,
                                                                    },
                                                                }}
                                                                transition={{
                                                                    duration: 0.8,
                                                                    ease: [0.04, 0.62, 0.23, 0.98],
                                                                }}
                                                            >
                                                                <Flex
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                >
                                                                    {column.render('Header')}
                                                                    {column.Header !== 'Core' &&
                                                                        isHeader(column) &&
                                                                        (isHeaderExpanded(
                                                                            column
                                                                        ) ? (
                                                                            <IconPadder>
                                                                                <CgArrowsMergeAltH
                                                                                    size={18}
                                                                                    onClick={() =>
                                                                                        handleGroupChange(
                                                                                            column
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </IconPadder>
                                                                        ) : (
                                                                            <IconPadder>
                                                                                <CgArrowsShrinkH
                                                                                    size={18}
                                                                                    onClick={() =>
                                                                                        handleGroupChange(
                                                                                            column
                                                                                        )
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
                                                                </Flex>
                                                            </motion.section>
                                                        )}
                                                    </AnimatePresence>
                                                </TH>
                                            );
                                        })}
                                    </motion.tr>
                                );
                            })}
                        </THead>

                        <tbody
                            // className={isScrolling ? undefined : 'scroll-inactive'}
                            ref={verticalRef}
                            onScroll={() => {
                                // console.log('hello')
                            }}
                            {...getTableBodyProps()}
                        >
                            {page.length > 0 ? (
                                page.map(row => {
                                    prepareRow(row);
                                    const { key, ...restRowProps } = row.getRowProps();
                                    return (
                                        <motion.tr key={key} layout="position" {...restRowProps}>
                                            {row.cells.map(cell => {
                                                const { key, style, ...restCellProps } =
                                                    cell.getCellProps();
                                                return (
                                                    <td
                                                        key={key}
                                                        style={{
                                                            paddingRight: 0,
                                                            paddingLeft: 0,
                                                            ...style,
                                                        }}
                                                        {...restCellProps}
                                                    >
                                                        <CellText>
                                                            <Typography variant="subtitle">
                                                                {cell.render('Cell')}
                                                            </Typography>
                                                        </CellText>
                                                    </td>
                                                );
                                            })}
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <Typography variant="p" error>
                                    There are no records to display.
                                </Typography>
                            )}
                        </tbody>
                    </table>
                </ScrollContainer>
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
