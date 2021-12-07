import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BsFillCaretDownFill, BsFillCaretUpFill, BsFilter } from 'react-icons/bs';
import { CgArrowsMergeAltH, CgArrowsShrinkH } from 'react-icons/cg';
import ScrollContainer from 'react-indiana-drag-scroll';
import {
    ColumnGroup,
    HeaderGroup,
    IdType,
    Row,
    useExpanded,
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    usePagination,
    useSortBy,
    useTable,
} from 'react-table';
import HEADERS from '../../constants/headers';
import {
    CallsetInfoFields,
    IndividualInfoFields,
    IndividualResponseFields,
    VariantQueryDataResult,
    VariantResponseFields,
    VariantResponseInfoFields,
} from '../../types';
import {
    addAdditionalFieldsAndFormatNulls,
    calculateColumnWidth,
    flattenBaseResults,
    isHeader,
    isHeaderExpanded,
} from '../../utils';
import { Button, Flex, InlineFlex, Tooltip, Typography } from '../index';
import AdvancedFilters from './AdvancedFilters';
import { CellPopover } from './CellPopover';
import ColumnVisibilityModal from './ColumnVisibilityModal';
import Footer from './Footer/Footer';
import PhenotypeViewer from './PhenotypeViewer';
import { CellText, IconPadder, Styles, TableFilters, TH, THead } from './Table.styles';
import { GlobalFilter } from './TableFilter/GlobalFilters';

interface TableProps {
    variantData: VariantQueryDataResult[];
}

export type FlattenedQueryResponse = Omit<IndividualResponseFields, 'info' | 'diseases'> &
    IndividualInfoFields & { contactInfo: string } & Omit<
        VariantResponseFields,
        'callsets' | 'info'
    > &
    CallsetInfoFields &
    VariantResponseInfoFields & { source: string; diseases: string };
export interface ResultTableColumns extends FlattenedQueryResponse {
    aaChange: string;
    emptyCaseDetails: string;
    emptyVariationDetails: string;
}

const resolveSex = (sexPhenotype: string) => {
    if (sexPhenotype.toLowerCase().startsWith('m') || sexPhenotype === 'NCIT:C46112') {
        return 'Male';
    } else if (sexPhenotype.toLowerCase().startsWith('f') || sexPhenotype === 'NCIT:C46113') {
        return 'Female';
    } else if (sexPhenotype === 'NCIT:C46113') {
        return 'Other Sex';
    } else return 'Unknown';
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

const Table: React.FC<TableProps> = ({ variantData }) => {
    const [advancedFiltersOpen, setadvancedFiltersOpen] = useState<Boolean>(false);

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

    const filterTypes = useMemo(
        () => ({
            multiSelect: (
                rows: Row<ResultTableColumns>[],
                columnIds: IdType<ResultTableColumns>[],
                filterValue: string[]
            ) =>
                filterValue.length
                    ? rows.filter(row => filterValue.includes(row.values[columnIds[0]]))
                    : rows,
        }),
        []
    );

    // Dynamically adjust column width based on cell's longest text.
    const getColumnWidth = React.useCallback(calculateColumnWidth, []);

    const getChildColumns = (groupId: string) => {
        const targetGroup = columns.find(header => header.id === groupId);
        if (targetGroup) {
            return targetGroup.columns.filter(c => c.type !== 'empty').map(c => c.id) as string[];
        } else throw new Error(`Group ${groupId} not found!`);
    };

    const columns = useMemo(
        (): ColumnGroup<ResultTableColumns>[] => [
            {
                Header: 'Core',
                id: 'core',
                type: 'fixed',
                columns: [
                    {
                        accessor: state => state.referenceName,
                        id: 'chromosome',
                        type: 'fixed',
                        Header: 'Chromosome',
                        width: getColumnWidth(tableData, 'referenceName', 'Chromosome'),
                        disableFilters: true,
                    },
                    {
                        accessor: 'start',
                        id: 'start',
                        type: 'fixed',
                        Header: 'Start',
                        width: getColumnWidth(tableData, 'start', 'Start'),
                        filter: 'between',
                    },
                    {
                        accessor: 'end',
                        id: 'end',
                        type: 'fixed',
                        Header: 'End',
                        width: getColumnWidth(tableData, 'end', 'End'),
                        filter: 'between',
                    },
                    {
                        accessor: 'ref',
                        Cell: ({ row }) => <CellPopover state={row.original} id="ref" />,
                        id: 'ref',
                        Header: 'Ref',
                        type: 'fixed',
                    },
                    {
                        accessor: 'alt',
                        Cell: ({ row }) => <CellPopover state={row.original} id="alt" />,
                        id: 'alt',
                        Header: 'Alt',
                        type: 'fixed',
                    },
                    {
                        accessor: 'source',
                        filter: 'singleSelect',
                        id: 'source',
                        type: 'fixed',
                        Header: <Tooltip helperText={HEADERS['source']}>Source</Tooltip>,
                    },
                ],
            },
            {
                Header: 'Variation Details',
                id: 'variation_details',
                columns: [
                    {
                        id: 'emptyVariationDetails',
                        type: 'empty',
                        Header: '',
                        disableSortBy: true,
                        width: 79,
                    },
                    {
                        accessor: 'af',
                        id: 'af',
                        Header: <Tooltip helperText={HEADERS['af']}>gnomad_exome_AF</Tooltip>,
                        width: getColumnWidth(tableData, 'af', 'gnomad_exome_AF'),
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
                        type: 'empty',
                        Header: '',
                        disableSortBy: true,
                        width: 70,
                    },
                    {
                        accessor: 'individualId',
                        id: 'individualId',
                        Header: 'Individual ID',
                        width: getColumnWidth(tableData, 'individualId', 'Individual ID'),
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
                    },
                    {
                        accessor: 'ad',
                        id: 'ad',
                        Header: 'AD',
                    },
                    {
                        accessor: 'gq',
                        id: 'gq',
                        Header: 'GQ',
                    },
                    {
                        accessor: 'ethnicity',
                        id: 'ethnicity',
                        Header: <Tooltip helperText={HEADERS['ethnicity']}>Ethnicity</Tooltip>,
                        width: getColumnWidth(tableData, 'ethnicity', 'Ethnicity'),
                    },
                    {
                        accessor: 'phenotypicFeatures',
                        id: 'phenotypicFeatures',
                        Cell: ({ cell: { row } }) => (
                            <PhenotypeViewer
                                phenotypes={row.original.phenotypicFeatures}
                                expanded={row.isExpanded}
                                onClick={() => row.toggleRowExpanded(!row.isExpanded)}
                            ></PhenotypeViewer>
                        ),
                        Header: 'Phenotypes',
                        width: getColumnWidth(tableData, 'phenotypes', 'Phenotypes'),
                    },
                    {
                        accessor: 'sex',
                        filter: 'multiSelect',
                        id: 'sex',
                        Header: <Tooltip helperText={HEADERS['sex']}>Sex</Tooltip>,
                        Cell: ({ cell: { value } }) => <>{value ? resolveSex(value) : value}</>,
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
                        disableFilters: true,
                    },
                ],
            },
        ],
        [getColumnWidth, tableData]
    );

    const defaultColumn = useMemo(
        () => ({
            minWidth: 10,
            width: 60,
            maxWidth: 300,
        }),
        []
    );

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

    const toggleGroupVisibility = (g: HeaderGroup<ResultTableColumns>) =>
        g.columns?.map(c => c.type !== 'fixed' && toggleHideColumn(c.id, c.isVisible));

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

                <ColumnVisibilityModal
                    rows={rows}
                    headerGroups={headerGroups}
                    toggleGroupVisibility={toggleGroupVisibility}
                    toggleHideColumn={toggleHideColumn}
                    visibleColumns={visibleColumns}
                />
            </TableFilters>

            {advancedFiltersOpen && (
                <AdvancedFilters
                    columns={columns}
                    preFilteredRows={preFilteredRows}
                    filters={filters}
                    setFilter={setFilter}
                />
            )}
            <ScrollContainer ignoreElements="p" hideScrollbars={false} vertical={false}>
                <Styles>
                    <table {...getTableProps()}>
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
                                                                                        toggleGroupVisibility(
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
                                                                                        toggleGroupVisibility(
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
                </Styles>
            </ScrollContainer>

            <Footer
                props={{
                    pageSize,
                    pageCount,
                    pageIndex,
                    pageOptions,
                    canPreviousPage,
                    canNextPage,
                    gotoPage,
                    previousPage,
                    nextPage,
                    setPageSize,
                }}
            />
        </>
    );
};
export default Table;
