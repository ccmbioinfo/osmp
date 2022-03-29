import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CgArrowsMergeAltH, CgArrowsShrinkH } from 'react-icons/cg';
import { RiInformationFill } from 'react-icons/ri';
import { TiArrowSortedDown, TiArrowSortedUp, TiArrowUnsorted } from 'react-icons/ti';
import ScrollContainer from 'react-indiana-drag-scroll';
import {
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
import ColumnOrderModal from './ColumnOrderModal';
import ColumnVisibilityModal from './ColumnVisibilityModal';
import DownloadModal from './DownloadModal';
import FilterPopover from './FilterPopover';
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
    uniqueId: number;
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
                        Header: 'Chromosome',
                        width: getColumnWidth(tableData, 'referenceName', 'Chromosome'),
                        disableFilters: true,
                        disableSortBy: true,
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
                        id: 'ref',
                        Header: 'Ref',
                    },
                    {
                        accessor: 'alt',
                        id: 'alt',
                        Header: 'Alt',
                    },
                    {
                        accessor: 'source',
                        filter: 'singleSelect',
                        id: 'source',
                        Header: 'Source',
                        width: getColumnWidth(tableData, 'source', 'Source'),
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
                        width: getColumnWidth(tableData, 'zygosity', 'Zygosity'),
                    },
                    {
                        accessor: 'ad',
                        id: 'ad',
                        Header: 'AD',
                    },
                    {
                        accessor: 'dp',
                        id: 'dp',
                        Header: 'DP',
                    },
                    {
                        accessor: 'gq',
                        id: 'gq',
                        Header: 'GQ',
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
                        accessor: state =>
                            state.phenotypicFeatures
                                ? state.phenotypicFeatures.map(p => p.phenotypeLabel).join(', ')
                                : '',
                        id: 'phenotypicFeatures',
                        Cell: ({ row }: { row: Row<ResultTableColumns> }) => (
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
                        accessor: 'sex',
                        filter: 'multiSelect',
                        id: 'sex',
                        Header: 'Sex',
                        width: getColumnWidth(tableData, 'sex', 'Sex'),
                        Cell: ({ cell: { value } }) => <>{value ? resolveSex(value) : value}</>,
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
                        width: getColumnWidth(tableData, 'ethnicity', 'Ethnicity'),
                    },
                    {
                        accessor: 'diagnosis',
                        id: 'diagnosis',
                        Header: 'Diagnosis',
                        width: getColumnWidth(tableData, 'diagnosis', 'Diagnosis'),
                    },
                    {
                        accessor: 'diseases',
                        id: 'diseases',
                        Header: 'Diseases',
                        width: 120,
                    },
                    {
                        accessor: 'solved',
                        id: 'solved',
                        Header: 'Case Solved',
                        width: getColumnWidth(tableData, 'solvd', 'Case Solved'),
                    },
                    {
                        accessor: 'contactInfo',
                        Cell: ({ row }) => <CellPopover state={row.original} id="contactInfo" />,
                        id: 'contactInfo',
                        Header: 'Contact',
                        width: 120,
                        disableFilters: true,
                    },
                    {
                        accessor: 'geographicOrigin',
                        id: 'geographicOrigin',
                        Header: 'Geographic Origin',
                        width: getColumnWidth(tableData, 'geographicOrigin', 'Geographic Origin'),
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
                    { accessor: 'transcript', id: 'transcript', Header: 'transcript', width: 150 },
                    {
                        accessor: 'homozygousCount',
                        id: 'homozygousCount',
                        Header: 'Homozygous Count',
                        width: getColumnWidth(tableData, 'homozygousCount', 'Homozygous Count'),
                    },
                    {
                        accessor: 'heterozygousCount',
                        id: 'heterozygousCount',
                        Header: 'Heterozygous Count',
                        width: getColumnWidth(tableData, 'heterozygousCount', 'Heterozygous Count'),
                    },
                    { accessor: 'cdna', id: 'cdna', Header: 'cdna', width: 105 },
                    {
                        id: 'aaChange',
                        accessor: 'aaChange',
                        Header: 'aaChange',
                        width: 105,
                    },
                    {
                        accessor: 'consequence',
                        id: 'consequence',
                        Header: 'consequence',
                        width: 125,
                        filter: 'multiSelect',
                    },
                    {
                        accessor: 'af',
                        id: 'af',
                        Header: 'gnomad_exome_AF',
                        width: getColumnWidth(tableData, 'af', 'gnomad_exome_AF'),
                        filter: 'between',
                    },
                    /* { accessor: 'gnomadHet', id: 'gnomadHet', Header: 'gnomadHet', width: 105 }, */
                    {
                        accessor: 'gnomadHom',
                        id: 'gnomadHom',
                        Header: 'gnomadHom',
                        width: 105,
                        filter: 'between',
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
                    <ColumnOrderModal
                        allColumns={allColumns}
                        headerGroups={headerGroups}
                        setColumnOrder={setColumnOrder}
                    />
                    <ColumnVisibilityModal
                        rows={rows}
                        headerGroups={headerGroups}
                        toggleGroupVisibility={toggleGroupVisibility}
                        toggleHideColumn={toggleHideColumn}
                        visibleColumns={visibleColumns}
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
