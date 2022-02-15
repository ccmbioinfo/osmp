import { ColumnInstance, Filters, IdType, Row, UseFiltersInstanceProps } from 'react-table';
import styled from 'styled-components/macro';
import SOURCES from '../../constants/sources';
import { Column, Typography } from '../index';
import { Flex } from '../Layout';
import { ResultTableColumns } from './Table';
import { TableFilters } from './Table.styles';
import { ColumnFilter } from './TableFilter/ColumnFilter';

interface AdvancedFiltersProps<T extends {}> extends Pick<UseFiltersInstanceProps<T>, 'setFilter'> {
    columns: ColumnInstance<T>[];
    preFilteredRows: Row<T>[];
    filters: Filters<T>;
}

const FILTER_OPTIONS: { [K in keyof ResultTableColumns]?: string[] } = {
    source: SOURCES,
};

const SubtleText = styled.p`
    color: #bababa;
    font-size: ${props => props.theme.fontSizes.xs};
    margin-inline-end: ${props => props.theme.space[4]};
    &:hover {
        cursor: pointer;
    }
`;

export default function AdvancedFilters<T extends {}>({
    columns,
    preFilteredRows,
    filters,
    setFilter,
}: AdvancedFiltersProps<T>) {
    return (
        <TableFilters justifyContent="flex-start" alignItems="flex-start">
            {columns
                .filter(c => !!c.id && c.type !== 'empty' && !c.disableFilters)
                .map((v, i) => (
                    <Column key={i}>
                        <Flex justifyContent="space-between" fullWidth>
                            <Typography variant="subtitle" bold>
                                {v.Header}
                            </Typography>
                            <SubtleText onClick={() => setFilter(v.id, undefined)}>
                                Clear
                            </SubtleText>
                        </Flex>
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
