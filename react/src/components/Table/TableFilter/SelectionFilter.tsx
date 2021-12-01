import { isNullOrUndefined } from 'util';
import React, { useState } from 'react';
import { IdType, UseFiltersInstanceProps } from 'react-table';
import { ComboBox } from '../..';
import { DefaultFilter } from './ColumnFilter';

interface SelectionFilterProps<T extends {}>
    extends Pick<UseFiltersInstanceProps<T>, 'preFilteredRows' | 'setFilter'> {
    columnId: IdType<T>;
    options?: string[];
    filter?: DefaultFilter<string | string[]>;
    isMulti?: boolean;
    searchable?: boolean;
}

export function SelectionFilter<T extends {}>({
    setFilter,
    columnId,
    options,
    filter,
    isMulti,
    searchable,
    preFilteredRows,
}: SelectionFilterProps<T>) {
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
}

export default SelectionFilter;
