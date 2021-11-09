import React, { useEffect, useState } from 'react';
import { Row } from 'react-table';
import { Column, Input } from '../..';
import SOURCES from '../../../constants/sources';
import { useDebounce } from '../../../hooks';
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
    // Local input state for debouncing
    const filter = filters.find(f => f.id === columnId);
    const [debouncedInput, input, setInput] = useDebounce<string | undefined>('', 500);

    const placeholder = 'Search';

    const singleSelect = ['source'];
    const multiSelect = ['sex', 'zygosity', 'consequence'];

    useEffect(() => {
        // Do something with the debounced value
        // e.g., setCities(cities.filter(el => el.name.includes(debouncedValue)))
        setFilter(columnId, debouncedInput);
    }, [setFilter, debouncedInput, columnId]);

    useEffect(() => {
        if (!filter) setInput('');
    }, [filter, setInput]);
    const resolveComponent = () => {
        if (singleSelect.concat(multiSelect).includes(columnId)) {
            return (
                <SelectionFilter
                    setFilter={setFilter}
                    columnId={columnId}
                    options={singleSelect.includes(columnId) ? SOURCES : []}
                    filter={
                        singleSelect.includes(columnId)
                            ? (filter as DefaultFilter<string>)
                            : (filter as DefaultFilter<string[]>)
                    }
                    preFilteredRows={preFilteredRows}
                    isMulti={multiSelect.includes(columnId)}
                    searchable={multiSelect.includes(columnId)}
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
                    value={input}
                    placeholder={placeholder}
                    onChange={e => {
                        setInput(e.target.value);
                    }}
                />
            );
        }
    };

    return <Column>{resolveComponent()}</Column>;
};
