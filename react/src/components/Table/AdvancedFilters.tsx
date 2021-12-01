import { ColumnGroup, Filters, IdType, Row, UseFiltersInstanceProps } from 'react-table';
import SOURCES from '../../constants/sources';
import { Column, Typography } from '../index';
import './dragscroll.css';
import { ResultTableColumns } from './Table';
import { TableFilters } from './Table.styles';
import { ColumnFilter } from './TableFilter/ColumnFilter';

interface AdvancedFiltersProps<T extends {}> extends Pick<UseFiltersInstanceProps<T>, 'setFilter'> {
    columns: ColumnGroup<T>[];
    preFilteredRows: Row<T>[];
    filters: Filters<T>;
}

const FILTER_OPTIONS: { [K in keyof ResultTableColumns]?: string[] } = {
    source: SOURCES,
};

export default function AdvancedFilters<T extends {}>({
    columns,
    preFilteredRows,
    filters,
    setFilter,
}: AdvancedFiltersProps<T>) {
    return (
        <TableFilters justifyContent="flex-start" alignItems="flex-start">
            {columns
                .flatMap(c => c.columns)
                .sort((a, b) => ((a.id || 0) > (b.id || 0) ? 1 : -1))
                .filter(c => !!c.id && c.type !== 'empty' && !c.disableFilters)
                .map((v, i) => (
                    <Column key={i}>
                        <Typography variant="subtitle" bold>
                            {v.Header}
                        </Typography>
                        <ColumnFilter
                            preFilteredRows={preFilteredRows}
                            filterModel={filters.find(f => f.id === v.id)}
                            options={
                                !!(!!v.id && !!FILTER_OPTIONS[v.id as keyof ResultTableColumns])
                                    ? FILTER_OPTIONS[v.id as keyof ResultTableColumns]
                                    : undefined
                            }
                            setFilter={setFilter.bind(null, v.id as string)}
                            type={v.filter as 'text' | 'multiSelect' | 'singleSelect'}
                            columnId={v.id as IdType<ResultTableColumns>}
                        />
                    </Column>
                ))}
        </TableFilters>
    );
}
