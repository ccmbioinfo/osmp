import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CgArrowsMergeAltH, CgArrowsShrinkH } from 'react-icons/cg';
import { RiInformationFill } from 'react-icons/ri';
import { TiArrowSortedDown, TiArrowSortedUp, TiArrowUnsorted } from 'react-icons/ti';
import ScrollContainer from 'react-indiana-drag-scroll';
import {
    Cell,
    ColumnGroup,
    HeaderGroup,
    IdType,
    Row,
    useColumnOrder,
    useExpanded,
    useFilters,
    useFlexLayout,
    useGlobalFilter,
    usePagination,
    useResizeColumns,
    useSortBy,
    useTable,
} from 'react-table';
import HEADERS from '../../constants/headers';
import theme from '../../constants/theme';
import {
    CallsetInfoFields,
    IndividualInfoFields,
    IndividualResponseFields,
    VariantQueryDataResult,
    VariantResponseFields,
    VariantResponseInfoFields,
} from '../../types';
import {
    calculateColumnWidth,
    isCaseDetailsCollapsed,
    isHeader,
    isHeaderExpanded,
    isHeterozygous,
    isHomozygous,
    prepareData,
} from '../../utils';
import { Button, Chip, Flex, InlineFlex, Tooltip, Typography } from '../index';
import { Column } from '../Layout';
import { CellPopover } from './CellPopover';
import ColumnVisibilityModal from './ColumnVisibilityModal';
import DownloadModal from './DownloadModal';
import FilterPopover from './FilterPopover';
import FlaggedGenesViewer from './FlaggedGenesViewer';
import PhenotypeViewer from './PhenotypeViewer';
import { CellText, IconPadder, Styles, SummaryText, TableFilters, TH, THead } from './Table.styles';
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
    homozygousCount?: number;
    heterozygousCount?: number;
    burdenCount?: number;
    uniqueId: number;
}

const Table: React.FC<TableProps> = ({ variantData }) => {
    const [tableData, uniqueVariantIndices] = useMemo(
        () => prepareData(variantData),
        [variantData]
    );

    const sortByArray = useMemo(
        () => [
            {
                id: 'uniqueId',
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
                Header: 'Variant',
                id: 'core',
                disableSortBy: true,
                disableFilters: true,
                columns: [
                    {
                        id: 'emptyCore',
                        type: 'empty',
                        Header: '',
                        disableSortBy: true,
                        disableFilters: true,
                        width: 70,
                    },
                    {
                        accessor: 'uniqueId',
                        id: 'uniqueId',
                        type: 'fixed',
                    },
                    {
                        accessor: state => state.referenceName,
                        id: 'chromosome',
                        Header: 'Chr',
                        width: getColumnWidth('Chr'),
                        disableFilters: true,
                        disableSortBy: true,
                    },
                    {
                        accessor: 'start',
                        id: 'start',
                        Header: 'Start',
                        width: getColumnWidth('Start'),
                        filter: 'between',
                    },
                    {
                        accessor: 'end',
                        id: 'end',
                        Header: 'End',
                        width: getColumnWidth('End'),
                        filter: 'between',
                    },
                    {
                        accessor: 'ref',
                        id: 'ref',
                        Header: 'Ref',
                        width: getColumnWidth('Ref'),
                    },
                    {
                        accessor: 'alt',
                        id: 'alt',
                        Header: 'Alt',
                        width: getColumnWidth('Alt'),
                    },
                    {
                        accessor: 'assemblyId',
                        id: 'originalAssembly',
                        Header: 'Original Assembly',
                        width: getColumnWidth('Original Assembly'),
                    },
                    {
                        accessor: 'assemblyIdCurrent',
                        id: 'currentAssembly',
                        Header: 'Current Assembly',
                        width: getColumnWidth('Current Assembly'),
                    },
                    {
                        accessor: 'source',
                        filter: 'singleSelect',
                        id: 'source',
                        Header: 'Source',
                        width: getColumnWidth('Source', true),
                    },
                ],
            },
            {
                Header: 'Variant Details',
                id: 'variation_details',
                disableSortBy: true,
                disableFilters: true,
                columns: [
                    {
                        id: 'emptyVariationDetails',
                        type: 'empty',
                        Header: '',
                        disableSortBy: true,
                        disableFilters: true,
                        width: 79,
                    },
                    {
                        accessor: 'transcript',
                        id: 'transcript',
                        Header: 'transcript',
                        width: getColumnWidth('transcript'),
                    },
                    {
                        accessor: 'homozygousCount',
                        id: 'homozygousCount',
                        Header: 'Homo Count',
                        width: getColumnWidth('Homo Count'),
                    },
                    {
                        accessor: 'heterozygousCount',
                        id: 'heterozygousCount',
                        Header: 'Het Count',
                        width: getColumnWidth('Het Count'),
                    },
                    { accessor: 'cdna', id: 'cdna', Header: 'cdna', width: getColumnWidth('cdna') },
                    {
                        id: 'aaChange',
                        accessor: 'aaChange',
                        Header: 'aaChange',
                        width: getColumnWidth('aaChange'),
                    },
                    {
                        accessor: 'consequence',
                        id: 'consequence',
                        Header: 'consequence',
                        width: getColumnWidth('consequence'),
                        filter: 'multiSelect',
                    },
                    {
                        accessor: 'af',
                        id: 'af',
                        Header: 'gnomad_exome_AF',
                        width: getColumnWidth('gnomad_exome_AF', true),
                        filter: 'between',
                    },
                    /* { accessor: 'gnomadHet', id: 'gnomadHet', Header: 'gnomadHet', width: 105 }, */
                    {
                        accessor: 'gnomadHom',
                        id: 'gnomadHom',
                        Header: 'gnomadHom',
                        width: getColumnWidth('gnomadHom'),
                        filter: 'between',
                    },
                    {
                        accessor: 'phred',
                        id: 'phred',
                        Header: 'CADD score',
                        width: getColumnWidth('CADD score'),
                        filter: 'between',
                    },
                    {
                        accessor: 'spliceAIScore',
                        id: 'spliceAIScore',
                        Header: 'SpliceAI score',
                        width: getColumnWidth('SpliceAI score'),
                        filter: 'between',
                    },
                    {
                        accessor: 'spliceAIType',
                        id: 'spliceAIType',
                        Header: 'SpliceAI type',
                        width: getColumnWidth('SpliceAI type'),
                        filter: 'multiSelect',
                    },
                ],
            },
            {
                Header: 'Case Details',
                id: 'case_details',
                disableSortBy: true,
                disableFilters: true,
                columns: [
                    {
                        id: 'emptyCaseDetails',
                        type: 'empty',
                        Header: '',
                        disableSortBy: true,
                        disableFilters: true,
                        width: 70,
                    },
                    {
                        accessor: state =>
                            isHeterozygous(state.zygosity)
                                ? 'Heterozygous'
                                : isHomozygous(state.zygosity)
                                ? 'Homozygous'
                                : state.zygosity,
                        filter: 'multiSelect',
                        id: 'zygosity',
                        Header: 'Zygosity',
                        width: getColumnWidth('Zygosity'),
                    },
                    {
                        accessor: 'burdenCount',
                        id: 'burdenCount',
                        Header: 'Burden Count',
                        width: getColumnWidth('Burden Count'),
                        filter: 'between',
                    },
                    {
                        accessor: 'ad',
                        id: 'ad',
                        Header: 'AD',
                        width: getColumnWidth('AD'),
                        filter: 'between',
                    },
                    {
                        accessor: 'dp',
                        id: 'dp',
                        Header: 'DP',
                        width: getColumnWidth('DP'),
                        filter: 'between',
                    },
                    {
                        accessor: 'gq',
                        id: 'gq',
                        Header: 'GQ',
                        width: getColumnWidth('GQ'),
                        filter: 'between',
                    },
                    {
                        accessor: 'individualId',
                        id: 'individualId',
                        Header: 'Individual ID',
                        width: getColumnWidth('Individual ID'),
                    },
                    {
                        accessor: 'sex',
                        filter: 'multiSelect',
                        id: 'sex',
                        Header: 'Sex',
                        width: getColumnWidth('Sex', true),
                    },
                    {
                        accessor: 'diseases',
                        id: 'diseases',
                        filter: 'multiSelect',
                        Header: 'Diseases',
                        width: getColumnWidth('Diseases', true),
                    },
                    {
                        accessor: 'diagnosis',
                        filter: 'multiSelect',
                        id: 'affectedStatus',
                        Header: 'Affected Status',
                        width: getColumnWidth('Affected Status'),
                    },
                    {
                        accessor: state => {
                            const genes = !!state.candidateGene
                                ? state.candidateGene.split('\n')
                                : [];
                            const classifications = !!state.classifications
                                ? state.classifications.split('\n')
                                : [];

                            return genes.length > 0 && classifications.length > 0
                                ? genes.map((gene, index) => `${gene} - ${classifications[index]}`)
                                : null;
                        },
                        id: 'flaggedGenes',
                        Header: 'Flagged Gene(s)',
                        width: getColumnWidth('Flagged Gene(s)'),
                        Cell: ({
                            cell: { value },
                            row: { isExpanded, toggleRowExpanded },
                        }: {
                            cell: Cell<ResultTableColumns>;
                            row: Row<ResultTableColumns>;
                        }) => (
                            <FlaggedGenesViewer
                                {...{ toggleRowExpanded }}
                                flaggedGenes={value}
                                rowExpanded={isExpanded}
                            />
                        ),
                    },
                    {
                        accessor: state =>
                            state.phenotypicFeatures
                                ? state.phenotypicFeatures.map(p => p.phenotypeLabel).join(', ')
                                : '',
                        id: 'phenotypicFeatures',
                        Header: 'Phenotypes',
                        width: getColumnWidth('Phenotypes'),
                        Cell: ({
                            row: {
                                isExpanded,
                                original: { clinicalStatus, phenotypicFeatures },
                                toggleRowExpanded,
                            },
                        }: {
                            row: Row<ResultTableColumns>;
                        }) => (
                            <PhenotypeViewer
                                {...{ toggleRowExpanded }}
                                phenotypes={phenotypicFeatures}
                                rowExpanded={isExpanded}
                                clinicalStatus={clinicalStatus}
                            />
                        ),
                    },
                    {
                        accessor: 'ethnicity',
                        id: 'ethnicity',
                        Cell: ({ row }) => (
                            <CellText capitalize>
                                <CellPopover state={row.original} id="ethnicity" />
                            </CellText>
                        ),
                        Header: 'Ethnicity',
                        width: getColumnWidth('Ethnicity', true),
                    },
                    {
                        accessor: 'contactInfo',
                        Cell: ({ row }) => (
                            <CellText>
                                <CellPopover state={row.original} id="contactInfo" />
                            </CellText>
                        ),
                        id: 'contactInfo',
                        Header: 'Contact',
                        width: getColumnWidth(
                            'Contact',
                            true,
                            Math.max(...tableData.map(row => (row.contactInfo || '').length))
                        ),
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
                pageSize: tableData.length,
                sortBy: sortByArray,
                hiddenColumns: [
                    getChildColumns('case_details'),
                    getChildColumns('variation_details'),
                    'emptyCore',
                    'uniqueId',
                ].flat(),
            },
        },
        useColumnOrder,
        useFilters,
        useResizeColumns,
        useFlexLayout,
        useGlobalFilter,
        useSortBy,
        useExpanded,
        usePagination
    );

    const {
        allColumns,
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        state,
        setColumnOrder,
        setFilter,
        setAllFilters,
        setGlobalFilter,
        prepareRow,
        preFilteredRows,
        toggleHideColumn,
        visibleColumns,
        rows,
    } = tableInstance;

    const { filters, globalFilter } = state;

    const toggleGroupVisibility = (g: HeaderGroup<ResultTableColumns>) =>
        g.columns?.map(c => c.type !== 'fixed' && toggleHideColumn(c.id, c.isVisible));

    var currColour = 'white';

    const getRowColour = (uniqueId: number, previousRowUniqueId: number) => {
        if (currColour === 'white' && uniqueId !== previousRowUniqueId) {
            currColour = 'whitesmoke';
        } else if (uniqueId !== previousRowUniqueId) {
            currColour = 'white';
        }
        return [{ style: { background: currColour } }];
    };
    return (
        <>
            <TableFilters justifyContent="space-between">
                <InlineFlex>
                    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                    <Button
                        disabled={filters.length > 0 ? false : true}
                        variant="secondary"
                        onClick={() => setAllFilters([])}
                    >
                        Clear all filters
                    </Button>
                </InlineFlex>

                <InlineFlex>
                    <ColumnVisibilityModal
                        headerGroups={headerGroups}
                        toggleGroupVisibility={toggleGroupVisibility}
                        toggleHideColumn={toggleHideColumn}
                        allColumns={allColumns}
                        setColumnOrder={setColumnOrder}
                    />
                    <DownloadModal rows={rows} visibleColumns={visibleColumns} />
                </InlineFlex>
            </TableFilters>

            <Column>
                <br />
                <Typography variant="h3">
                    {uniqueVariantIndices.length} unique variants found in {tableData.length}{' '}
                    individuals
                </Typography>
                {rows.length !== tableData.length && (
                    <SummaryText>{rows.length} individuals matching your filters</SummaryText>
                )}
                <Flex alignItems="center">
                    <Typography variant="p" bold>
                        Active Filters:
                    </Typography>
                    {filters.map((f, i) => (
                        <div key={i}>
                            <Chip title={f.id} onDelete={() => setFilter(f.id, undefined)} />
                        </div>
                    ))}
                </Flex>
            </Column>

            <ScrollContainer ignoreElements="p, th" hideScrollbars={false} vertical={false}>
                <Styles disableFullWidth={visibleColumns.length > 12}>
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
                                                column.getHeaderProps();
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
                                                                    nowrap
                                                                >
                                                                    {/* 
                                                                        Filter icon for filtering individual columns
                                                                    */}
                                                                    {!column.disableFilters && (
                                                                        <FilterPopover
                                                                            columns={[column]}
                                                                            preFilteredRows={
                                                                                preFilteredRows
                                                                            }
                                                                            filters={filters}
                                                                            setFilter={setFilter}
                                                                            active={
                                                                                !!filters.find(
                                                                                    c =>
                                                                                        c.id ===
                                                                                        column.id
                                                                                )
                                                                            }
                                                                        />
                                                                    )}
                                                                    {column.render('Header')}
                                                                    {!column.id.includes('empty') &&
                                                                        !!HEADERS[column.id] && (
                                                                            <Tooltip
                                                                                helperText={
                                                                                    HEADERS[
                                                                                        column.id
                                                                                    ]
                                                                                }
                                                                            >
                                                                                <IconPadder>
                                                                                    <RiInformationFill color="lightgrey" />
                                                                                </IconPadder>
                                                                            </Tooltip>
                                                                        )}

                                                                    {/* Use column.getResizerProps to hook up the events correctly */}
                                                                    <div
                                                                        {...column.getResizerProps()}
                                                                        className={`resizer ${
                                                                            column.isResizing
                                                                                ? 'isResizing'
                                                                                : ''
                                                                        }`}
                                                                    />

                                                                    {/* Large header grouping */}
                                                                    {isHeader(column) &&
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

                                                                    {/* Sorting */}
                                                                    <div
                                                                        {...column.getSortByToggleProps(
                                                                            {
                                                                                title: undefined,
                                                                            }
                                                                        )}
                                                                    >
                                                                        {!column.disableSortBy && (
                                                                            <IconPadder>
                                                                                {column.isSorted ? (
                                                                                    column.isSortedDesc ? (
                                                                                        <TiArrowSortedDown
                                                                                            color={
                                                                                                theme
                                                                                                    .colors
                                                                                                    .primary
                                                                                            }
                                                                                        />
                                                                                    ) : (
                                                                                        <TiArrowSortedUp
                                                                                            color={
                                                                                                theme
                                                                                                    .colors
                                                                                                    .primary
                                                                                            }
                                                                                        />
                                                                                    )
                                                                                ) : (
                                                                                    <TiArrowUnsorted color="lightgrey" />
                                                                                )}
                                                                            </IconPadder>
                                                                        )}
                                                                    </div>
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
                                page.map((row, i) => {
                                    prepareRow(row);
                                    // Alternate row's background colour.
                                    const { key, ...restRowProps } = row.getRowProps(
                                        i !== 0
                                            ? getRowColour(
                                                  row.values['uniqueId'],
                                                  page[i - 1].values['uniqueId']
                                              )
                                            : [{ style: { background: 'white' } }]
                                    );
                                    // Display only one row per variant if Case Details Section is collapsed.
                                    if (
                                        isCaseDetailsCollapsed(headerGroups[0].headers) &&
                                        uniqueVariantIndices.find(i => i === row?.index) ===
                                            undefined
                                    ) {
                                        return null;
                                    }
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
        </>
    );
};
export default Table;
