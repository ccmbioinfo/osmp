import React, { useEffect } from 'react';
import { Row } from 'react-table';
import { Column, Input } from '../..';
import { useDebounce } from '../../../hooks';
import { FlattenedQueryResponse } from '../Table';
import NumberRangeFilter from './NumberRangeFilter';
import SelectionFilter from './SelectionFilter';

export type DefaultFilter<T> = {
    id: string;
    value: T;
};

interface ColumnFilterProps {
    columnId: keyof FlattenedQueryResponse;
    filterModel?: DefaultFilter<string | string[] | number | number[]>;
    options?: string[];
    preFilteredRows: Row<FlattenedQueryResponse>[];
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
    const [debouncedInput, input, setInput] = useDebounce<string | undefined>('', 500);

    useEffect(() => {
        setFilter(debouncedInput);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedInput]);

    useEffect(() => {
        if (!filterModel) setInput('');
    }, [filterModel, setInput]);

    const placeholder = 'Search';

    const resolveComponent = () => {
        if (!!type && ['singleSelect', 'multiSelect'].includes(type)) {
            return (
                <SelectionFilter
                    setFilter={setFilter}
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
                        setInput(e.target.value);
                    }}
                />
            );
        }
    };

    return <Column>{resolveComponent()}</Column>;
};
