import React, { useEffect, useMemo, useState } from 'react';
import {
    Filters,
    IdType,
    useAsyncDebounce,
    UseFiltersColumnProps,
    UseFiltersInstanceProps,
} from 'react-table';
import { Column, Input } from '../..';
import NumberRangeFilter from './NumberRangeFilter';
import SelectionFilter from './SelectionFilter';

export type DefaultFilter<T> = {
    id: string;
    value: T;
};

interface ColumnFilterProps<T extends {}>
    extends Pick<UseFiltersInstanceProps<T>, 'preFilteredRows'>,
        Pick<UseFiltersColumnProps<T>, 'setFilter'> {
    columnId: IdType<T>;
    filters: Filters<T>;
    filterModel?: DefaultFilter<string | string[] | number | number[]>;
    options?: string[];
    type?: 'singleSelect' | 'multiSelect' | 'text' | 'between';
}

export function ColumnFilter<T extends {}>({
    columnId,
    filterModel,
    options,
    filters,
    preFilteredRows,
    setFilter,
    type,
}: ColumnFilterProps<T>) {
    const value = useMemo(() => {
        if (filters) {
            return filters.find(filter => filter.id === columnId)?.value;
        } else {
            return '';
        }
    }, [filters, columnId]);

    const [input, setInput] = useState<string>(value);

    useEffect(() => {
        if (!filterModel) setInput('');
    }, [filterModel, setInput]);

    const placeholder = 'Search';

    const debouncedSetFilter = useAsyncDebounce((filterValue: any) => setFilter(filterValue), 500);

    const handleChange = (val: string) => {
        debouncedSetFilter(val);
        setInput(val);
    };

    const resolveComponent = () => {
        if (!!type && ['singleSelect', 'multiSelect'].includes(type)) {
            return (
                <SelectionFilter
                    setFilter={debouncedSetFilter}
                    columnId={columnId}
                    options={options || []}
                    filter={filterModel as DefaultFilter<string | string[]>}
                    preFilteredRows={preFilteredRows}
                    isMulti={type === 'multiSelect'}
                    searchable={type === 'multiSelect'}
                />
            );
        } else if (!!type && type === 'between') {
            if (filterModel === undefined) {
                filterModel = {
                    id: columnId,
                    value: [-Infinity, +Infinity],
                };
            }
            return (
                <NumberRangeFilter
                    filter={filterModel as DefaultFilter<number[]>}
                    setFilter={setFilter}
                />
            );
        } else {
            return (
                <Input
                    variant="outlined"
                    value={input}
                    placeholder={placeholder}
                    onChange={e => handleChange(e.target.value)}
                />
            );
        }
    };

    return <Column>{resolveComponent()}</Column>;
}
