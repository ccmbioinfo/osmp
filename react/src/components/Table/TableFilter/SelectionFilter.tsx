import React from 'react';
import { Row } from 'react-table';
import { ComboBox } from '../..';
import { FlattenedQueryResponse } from '../Table';
import { DefaultFilter } from './ColumnFilter';

interface SelectionFilterProps {
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
    options?: string[];
    filter?: DefaultFilter;
    preFilteredRows: Row<FlattenedQueryResponse>[];
}

const SelectionFilter: React.FC<SelectionFilterProps> = ({
    setFilter,
    columnId,
    options,
    filter,
    preFilteredRows,
}) => {
    // If no explicit list of options is provided, we dynamically calculate the options from the table query results.
    const dynamicOptions = React.useMemo(() => {
        const options: Set<string> = new Set();
        preFilteredRows.forEach(row => {
            options.add(row.values[columnId]);
        });
        return [...options.values()];
    }, [columnId, preFilteredRows]);

    const selections = options || dynamicOptions;

    return (
        <ComboBox
            options={selections
                .sort()
                .map((n, id) => ({
                    id,
                    value: n,
                    label: n,
                }))
                .concat({ id: selections.length, label: 'All', value: '' })}
            onSelect={val => setFilter(columnId, val)}
            placeholder="Select"
            value={filter ? filter.value.toString() : ''}
        />
    );
};

export default SelectionFilter;
