import React from 'react';
import { Row } from 'react-table';
import { Column, Input } from '..';
import CHROMOSOMES from '../../constants/chromosomes';
import SOURCES from '../../constants/sources';
import NumberRangeFilter from './NumberRangeFilter';
import SelectionFilter from './SelectionFilter';
import { FlattenedQueryResponse } from './Table';

export type DefaultFilter = {
    id: string;
    value: string | number | Array<number>;
};

interface ColumnFilterProps {
    filters: DefaultFilter[];
    preFilteredRows: Row<FlattenedQueryResponse>[];
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({
    filters,
    setFilter,
    columnId,
    preFilteredRows,
}) => {
    const filter = filters.find(f => f.id === columnId);

    const placeholder = 'Search';

    const resolveComponent = () => {
        if (columnId === 'source') {
            return (
                <SelectionFilter
                    setFilter={setFilter}
                    columnId={columnId}
                    options={SOURCES}
                    filter={filter}
                />
            );
        } else if (columnId === 'chromosome') {
            return (
                <SelectionFilter
                    setFilter={setFilter}
                    columnId={columnId}
                    options={CHROMOSOMES}
                    filter={filter}
                />
            );
        } else if (columnId === 'start' || columnId === 'end') {
            return (
                <NumberRangeFilter
                    setFilter={setFilter}
                    filters={filters}
                    columnId={columnId}
                    preFilteredRows={preFilteredRows}
                />
            );
        } else {
            return (
                <Input
                    variant="outlined"
                    value={filter ? filter.value.toString() : ''}
                    placeholder={placeholder}
                    onChange={e => setFilter(columnId, e.target.value)}
                />
            );
        }
    };

    return <Column>{resolveComponent()}</Column>;
};
