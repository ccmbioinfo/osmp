import React from 'react';
import { ComboBox, Input } from '..';
import { DefaultFilter } from './ColumnFilter';

interface SelectionFilterProps {
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
    options: string[];
    filter?: DefaultFilter;
}

const SelectionFilter: React.FC<SelectionFilterProps> = ({
    setFilter,
    columnId,
    options,
    filter,
}) => {
    return (
        <ComboBox
            options={options
                .map((n, id) => ({
                    id,
                    value: n,
                    label: n,
                }))
                .concat({ id: options.length, label: 'all', value: '' })}
            onSelect={val => setFilter(columnId, val)}
            placeholder="Select"
            value={filter ? filter.value.toString() : ''}
        />
    );
};

export default SelectionFilter;
