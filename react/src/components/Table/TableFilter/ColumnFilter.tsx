import React, { useEffect, useState } from 'react';
import { IdType, useAsyncDebounce, UseFiltersInstanceProps } from 'react-table';
import { Column, Input } from '../..';
import NumberRangeFilter from './NumberRangeFilter';
import SelectionFilter from './SelectionFilter';

export type DefaultFilter<T> = {
    id: string;
    value: T;
};

interface ColumnFilterProps<T extends {}>
    extends Pick<UseFiltersInstanceProps<T>, 'preFilteredRows' | 'setFilter'> {
    columnId: IdType<T>;
    filterModel?: DefaultFilter<string | string[] | number | number[]>;
    options?: string[];
    type?: 'singleSelect' | 'multiSelect' | 'text' | 'between';
}

export function ColumnFilter<T extends {}>({
    columnId,
    filterModel,
    options,
    preFilteredRows,
    setFilter,
    type,
}: ColumnFilterProps<T>) {
    const [input, setInput] = useState<string>('');

    useEffect(() => {
        if (!filterModel) setInput('');
    }, [filterModel, setInput]);

    const placeholder = 'Search';

    const debouncedSetFilter = useAsyncDebounce(
        (filterValue: any) => setFilter(columnId, filterValue),
        500
    );

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
            return <NumberRangeFilter columnId={columnId} setFilter={setFilter} />;
        } else {
            return (
                <Input
                    variant="outlined"
                    value={input}
                    placeholder={placeholder}
                    onChange={e => {
                        handleChange(e.target.value);
                    }}
                />
            );
        }
    };

    return <Column>{resolveComponent()}</Column>;
}
