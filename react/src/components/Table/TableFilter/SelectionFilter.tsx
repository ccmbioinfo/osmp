import React from 'react';
import { Row } from 'react-table';
import { ComboBox } from '../..';
import { FlattenedQueryResponse } from '../Table';
import { DefaultFilter } from './ColumnFilter';

interface SelectionFilterProps {
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
    options?: string[];
    filter?: DefaultFilter<string | string[]>;
    isMulti?: boolean;
    preFilteredRows: Row<FlattenedQueryResponse>[];
}

const SelectionFilter: React.FC<SelectionFilterProps> = ({
    setFilter,
    columnId,
    options,
    filter,
    isMulti,
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

    const selections = options && !options.length ? options : dynamicOptions;

    const handleSelectionFilter = (val: string) => {
        if (isMulti) {
            if (filter) {
                setFilter(columnId, (filter: string[]) => {
                    return filter.includes(val) ? filter.filter(v => v !== val) : [...filter, val];
                });
            } else {
                setFilter(columnId, [val]);
            }
        } else {
            setFilter(columnId, val);
        }
    };

    return (
        <ComboBox
            options={selections.sort().map((n, id) => ({
                id,
                value: n,
                label: n,
            }))}
            onSelect={handleSelectionFilter}
            placeholder="Select"
            value={filter ? filter.value.toString() : ''}
            selection={(filter?.value as string[]) || []}
            isMulti={isMulti}
        />
    );
};

export default SelectionFilter;
