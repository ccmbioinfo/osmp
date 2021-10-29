import React from 'react';
import { Row } from 'react-table';
import { Column, Input } from '../..';
import SOURCES from '../../../constants/sources';
import { FlattenedQueryResponse } from '../Table';
import NumberRangeFilter from './NumberRangeFilter';
import SelectionFilter from './SelectionFilter';

export type DefaultFilter<T> = {
    id: string;
    value: T;
};

interface ColumnFilterProps {
    filters: DefaultFilter<string | string[] | number | number[]>[];
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
                    filter={filter as DefaultFilter<string>}
                    preFilteredRows={preFilteredRows}
                />
            );
        } else if (['sex', 'zygosity', 'consequence'].includes(columnId)) {
            return (
                <SelectionFilter
                    setFilter={setFilter}
                    columnId={columnId}
                    filter={filter as DefaultFilter<string[]>}
                    preFilteredRows={preFilteredRows}
                    isMulti
                />
            );
        } else if (columnId === 'start' || columnId === 'end') {
            return (
                <NumberRangeFilter
                    setFilter={setFilter}
                    filters={filters as DefaultFilter<number[]>[]}
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
