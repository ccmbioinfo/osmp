import React, { useMemo, useState } from 'react';
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
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    usePagination,
    useSortBy,
    useTable,
} from 'react-table';
import './dragscroll.css';
import { downloadCsv, useOverflow } from '../../hooks';
import {
    CallsetInfoFields,
    IndividualInfoFields,
    IndividualResponseFields,
    VariantQueryDataResult,
    VariantQueryResponseSchema,
    VariantResponseFields,
    VariantResponseInfoFields,
} from '../../types';
import { Button, Checkbox, Column, Flex, InlineFlex, Modal, Typography } from '../index';
import { ColumnFilter } from './ColumnFilter';
import { ContactPopover } from './ContactPopover';
import { GlobalFilter } from './GlobalFilters';
import {
    Footer,
    IconPadder,
    SkipToBeginning,
    SkipToEnd,
    Styles,
    TableFilters,
    TH,
    THead,
} from './Table.styles';

interface TableProps {
    variantData: VariantQueryDataResult[];
}

type FlattenedQueryResponse = Omit<
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
const flattenBaseResults = (
    result: VariantQueryResponseSchema,
    source: string
): FlattenedQueryResponse => {
    const contactInfo = result.contactInfo;
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
        phenotypes: flattenedPhenotypes,
        ...restVariant,
        ...restIndividual,
        ...individualInfo,
        source,
        ...variantInfo,
    };
};

/* flatten data */
const prepareData = (queryResult: VariantQueryDataResult[]) => {
    const results: FlattenedQueryResponse[] = [];
    queryResult.forEach(r => {
        const source = r.source;
        r.data.forEach(d => {
            if (d.variant.callsets.length) {
                //one row per individual per callset
                d.variant.callsets
                    .filter(cs => cs.individualId === d.individual.individualId)
                    .forEach(cs => {
                        results.push({
                            ...cs.info,
                            ...flattenBaseResults(d, source),
                        });
                    });
            } else {
                results.push(flattenBaseResults(d, source));
            }
        });
    });
    return results;
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
        () => ['core', 'chromosome', 'refseqId', 'alt', 'ref', 'start', 'end', 'source'],
        []
    );

    const dummyColumns = React.useMemo(() => ['empty_variation_details', 'empty_case_details'], []);

    type Accessor = string | (() => JSX.Element) | ((state: any) => any);
    // Dynamically adjust column width based on cell's longest text.
    const getColumnWidth = React.useCallback(
        (data: FlattenedQueryResponse[], accessor: Accessor, headerText: string) => {
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
        (): ColumnGroup<FlattenedQueryResponse>[] => [
            {
                Header: 'Core',
                id: 'core',
                columns: [
                    {
                        accessor: state => state.refSeqId,
                        id: 'chromosome',
                        Header: 'Chromosome',
                        width: getColumnWidth(tableData, 'refseqId', 'Chromosome'),
                    },
                    {
                        accessor: 'alt',
                        id: 'alt',
                        Header: 'Alt',
                        width: getColumnWidth(tableData, 'alt', 'Alt'),
                    },
                    {
                        accessor: 'ref',
                        id: 'ref',
                        Header: 'Ref',
                        width: getColumnWidth(tableData, 'refseqId', 'Chromosome'),
                    },
                    {
                        accessor: 'start',
                        id: 'start',
                        Header: 'Start',
                        width: getColumnWidth(tableData, 'start', 'Start'),
                    },
                    {
                        accessor: 'end',
                        id: 'end',
                        Header: 'End',
                        width: getColumnWidth(tableData, 'end', 'End'),
                    },
                    {
                        accessor: 'source',
                        id: 'source',
                        Header: 'Source',
                        width: getColumnWidth(tableData, 'source', 'Source'),
                    },
                ],
            },
            {
                Header: 'Variation Details',
                id: 'variation_details',
                columns: [
                    {
                        id: 'empty_variation_details',
                        Header: '',
                        disableSortBy: true,
                        width: 79,
                    },
                    { accessor: 'aaAlt', id: 'aaAlt', Header: 'aaAlt', width: 105 },
                    { accessor: 'aaPos', id: 'aaPos', Header: 'aaPos', width: 105 },
                    { accessor: 'aaRef', id: 'aaRef', Header: 'aaRef', width: 105 },
                    { accessor: 'cdna', id: 'cdna', Header: 'cdna', width: 105 },
                    {
                        accessor: 'consequence',
                        id: 'consequence',
                        Header: 'consequence',
                        width: 105,
                    },
                    { accessor: 'gnomadHet', id: 'gnomadHet', Header: 'gnomadHet', width: 105 },
                    { accessor: 'gnomadHom', id: 'gnomadHom', Header: 'gnomadHom', width: 105 },
                    { accessor: 'transcript', id: 'transcript', Header: 'transcript', width: 105 },
                ],
            },
            {
                Header: 'Case Details',
                id: 'case_details',
                columns: [
                    {
                        id: 'empty_case_details',
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
                        Header: 'Ethnicity',
                        width: getColumnWidth(tableData, 'ethnicity', 'Ethnicity'),
                    },
                    {
                        accessor: 'phenotypes',
                        id: 'phenotypes',
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
                        id: 'sex',
                        Header: 'Sex',
                        width: getColumnWidth(tableData, 'sex', 'Sex'),
                    },
                    {
                        accessor: 'zygosity',
                        id: 'zygosity',
                        Header: 'Zygosity',
                        width: getColumnWidth(tableData, 'zygosity', 'Zygosity'),
                    },
                    {
                        accessor: 'geographicOrigin',
                        id: 'geographicOrigin',
                        Header: 'Geographic Origin',
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
                        Header: 'Diseases',
                        width: getColumnWidth(tableData, 'diseases', 'Diseases'),
                    },
                    {
                        accessor: 'diagnosis',
                        id: 'diagnosis',
                        Header: 'Diagnosis',
                        width: getColumnWidth(tableData, 'diagnosis', 'Diagnosis'),
                    },
                    {
                        accessor: state => <ContactPopover state={state} />,
                        id: 'contact',
                        Header: 'Contact',
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

    const horizonstalRef = React.useRef(null);
    const { refXOverflowing } = useOverflow(horizonstalRef);

    const handleGroupChange = (g: HeaderGroup<FlattenedQueryResponse>) =>
        g.columns?.map(c => !fixedColumns.includes(c.id) && toggleHideColumn(c.id, c.isVisible));

    /**
     * The downloadCsv function takes in a JSON array for the csv export.
     * However, the contact column contains a button instead of a string.
     * The formatDataForCsv takes all visible row data that has been materialized on react-table
     * and replaces the contact button with the original email string.
     */
    const formatDataForCsv = <T extends Row<any>>(rows: T[]): T['values'][] =>
        rows.map(r => ({
            ...r.values,
            contact: (r.original as FlattenedQueryResponse).contactInfo,
        }));

    const isHeader = (column: HeaderGroup<FlattenedQueryResponse>) => !column.parent;

    const isHeaderExpanded = (column: HeaderGroup<FlattenedQueryResponse>) => {
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
                        onClick={() => {
                            downloadCsv(
                                formatDataForCsv(rows),
                                visibleColumns.map(c => c.id)
                            );
                        }}
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

            {advancedFiltersOpen && (
                <TableFilters justifyContent="flex-start" alignItems="flex-start">
                    {columns
                        .map(c => c.columns)
                        .flat()
                        .filter(c => !dummyColumns.includes(c.id as string))
                        .map((v, i) => (
                            <Column key={i}>
                                <Typography variant="subtitle" bold>
                                    {v.Header}
                                </Typography>
                                <ColumnFilter
                                    filters={filters}
                                    setFilter={setFilter}
                                    columnId={v.id as string}
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
                    <table {...getTableProps()} ref={horizonstalRef}>
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
                                                    column.getSortByToggleProps()
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

                        <tbody {...getTableBodyProps()}>
                            {page.length > 0 ? (
                                page.map(row => {
                                    prepareRow(row);
                                    const { key, ...restRowProps } = row.getRowProps();
                                    return (
                                        <motion.tr key={key} layout="position" {...restRowProps}>
                                            {row.cells.map(cell => {
                                                const { key, ...restCellProps } =
                                                    cell.getCellProps();
                                                return (
                                                    <td key={key} {...restCellProps}>
                                                        <Typography variant="subtitle">
                                                            {cell.render('Cell')}
                                                        </Typography>
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
