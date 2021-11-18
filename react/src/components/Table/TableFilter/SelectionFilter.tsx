import { isNullOrUndefined } from 'util';
import React, { useState } from 'react';
import { Row } from 'react-table';
import { ComboBox } from '../..';
import { ResultTableColumns } from '../Table';
import { DefaultFilter } from './ColumnFilter';

interface SelectionFilterProps {
    setFilter: (filterValue: any) => void;
    columnId: keyof ResultTableColumns;
    options?: string[];
    filter?: DefaultFilter<string | string[]>;
    isMulti?: boolean;
    searchable?: boolean;
    preFilteredRows: Row<ResultTableColumns>[];
}

const SelectionFilter: React.FC<SelectionFilterProps> = ({
    setFilter,
    columnId,
    options,
    filter,
    isMulti,
    searchable,
    preFilteredRows,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    // If no explicit list of options is provided, we dynamically calculate the options from the table query results.
    const dynamicOptions = React.useMemo(() => {
        return [...new Set(preFilteredRows.map(r => r.values[columnId]))];
    }, [columnId, preFilteredRows]);

    const selections = options && !!options.length ? options : dynamicOptions;

    const handleSelectionFilter = (val: string) => {
        setSearchTerm('');
        if (isMulti) {
            if (filter) {
                setFilter((filter: string[]) => {
                    return filter.includes(val) ? filter.filter(v => v !== val) : [...filter, val];
                });
            } else {
                setFilter([val]);
            }
        } else {
            setFilter(val);
        }
    };

    const resolveValue = () => {
        if (searchable) {
            return searchTerm;
        } else {
            return filter ? filter.value.toString() : '';
        }
    };

    return (
        <ComboBox
            options={selections
                .filter(s => s && s.toLowerCase().includes(searchTerm.toLowerCase()))
                .sort()
                .map((n, id) => ({
                    id,
                    value: n,
                    label: isNullOrUndefined(n) || !n.trim().length ? 'Not Available' : n,
                }))}
            onSelect={handleSelectionFilter}
            placeholder="Select"
            value={resolveValue()}
            selection={(filter?.value as string[]) || []}
            isMulti={isMulti}
            searchable={searchable}
            onChange={val => setSearchTerm(val || '')}
        />
    );
};

export default SelectionFilter;
