import React from 'react';
import { Row } from 'react-table';
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
                    value={(filterModel?.value || '') as string | number}
                    placeholder={placeholder}
                    onChange={e => {
                        setFilter(e.target.value);
                    }}
                />
            );
        }
    };

    return <Column>{resolveComponent()}</Column>;
};
