import React, { useEffect, useState } from 'react';
import { Row, useAsyncDebounce } from 'react-table';
import { Column, Input } from '../..';
import { ResultTableColumns } from '../Table';
import NumberRangeFilter from './NumberRangeFilter';
import SelectionFilter from './SelectionFilter';

export type DefaultFilter<T> = {
    id: string;
    value: T;
};

interface ColumnFilterProps {
    columnId: keyof ResultTableColumns;
    filterModel?: DefaultFilter<string | string[] | number | number[]>;
    options?: string[];
    preFilteredRows: Row<ResultTableColumns>[];
    setFilter: (filterValue: any) => void;
    type?: 'singleSelect' | 'multiSelect' | 'text' | 'between';
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({
    columnId,
    filterModel,
    options,
    preFilteredRows,
    setFilter,
    type,
}) => {
    const [input, setInput] = useState<string>('');

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
            return <NumberRangeFilter setFilter={setFilter} />;
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
};
