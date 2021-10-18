import React, { useState } from 'react';
import { Row } from 'react-table';
import { Flex, Input } from '..';
import CHROMOSOMES from '../../constants/chromosomes';
import SOURCES from '../../constants/sources';
import ComboBox from '../ComboBox';
import { FlattenedQueryResponse } from './Table';
import { InputComparisonDropdown, FilterComparison } from './InputComparisonDropdown';

type DefaultFilter = {
    id: string;
    value: string | number | Array<number>;
};

interface ColumnFilterProps {
    filters: DefaultFilter[];
    preFilteredRows: Row<FlattenedQueryResponse>[];
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({
    filters,
    setFilter,
    columnId,
    preFilteredRows,
}) => {
    const [filterComparison, setFilterComparison] = useState<FilterComparison>({
        start: {
            less: false,
            greater: false,
            equal: true,
        },
        end: {
            less: false,
            greater: false,
            equal: true,
        },
    });

    const [min, max] = React.useMemo(() => {
        let min = preFilteredRows.length ? preFilteredRows[0].values[columnId] : 0;
        let max = preFilteredRows.length ? preFilteredRows[0].values[columnId] : 0;
        preFilteredRows.forEach(row => {
            min = Math.min(row.values[columnId], min);
            max = Math.max(row.values[columnId], max);
        });
        return [min, max];
    }, [columnId, preFilteredRows]);

    const filter = filters.find(f => f.id === columnId);

    const placeholder = 'Search';

    const resolveComponent = () => {
        if (columnId === 'source') {
            return (
                <ComboBox
                    options={SOURCES.map((n, id) => ({
                        id,
                        value: n,
                        label: n,
                    })).concat({ id: 3, label: 'all', value: '' })}
                    onSelect={val => setFilter('source', val)}
                    placeholder="Select"
                    value={filter ? filter.value.toString() : ''}
                />
            );
        } else if (columnId === 'chromosome') {
            return (
                <ComboBox
                    options={CHROMOSOMES.map((n, id) => ({
                        id,
                        value: n,
                        label: n,
                    }))}
                    onSelect={val => setFilter('chromosome', val)}
                    placeholder="Select"
                    value={filter ? filter.value.toString() : ''}
                />
            );
        } else if (columnId === 'start' || columnId === 'end') {
            console.log('HELLO FILTERS', filters);
            const filterValue = filters.filter(f => f.id === columnId)[0]?.value as Array<number>;
            console.log(filterValue);
            const comparison = filterComparison[columnId];
            if (comparison.less) {
                return (
                    <Input
                        value={filterValue ? filterValue[1] : ''}
                        onChange={e => {
                            const val = e.target.value;
                            console.log(val, filterValue);
                            setFilter(columnId, (old = []) => [
                                min,
                                val ? parseInt(val, 10) : undefined,
                            ]);
                        }}
                        placeholder={`Max (${max})`}
                        InputAdornmentStart={
                            <InputComparisonDropdown
                                columnId={columnId}
                                filterComparison={filterComparison}
                                setFilterComparison={setFilterComparison}
                            />
                        }
                    />
                );
            } else if (comparison.greater) {
                return (
                    <Input
                        value={filterValue ? filterValue[1] : ''}
                        onChange={e => {
                            const val = e.target.value;
                            setFilter(columnId, (old = []) => [
                                val ? parseInt(val, 10) : undefined,
                                max,
                            ]);
                        }}
                        placeholder={`Min (${min})`}
                        InputAdornmentStart={
                            <InputComparisonDropdown
                                columnId={columnId}
                                filterComparison={filterComparison}
                                setFilterComparison={setFilterComparison}
                            />
                        }
                    />
                );
            } else {
                return (
                    <Input
                        value={filterValue ? filterValue[1] : ''}
                        onChange={e => {
                            const val = e.target.value;
                            const filter = val ? parseInt(val, 10) : undefined;
                            setFilter(columnId, () => [filter, filter]);
                        }}
                        placeholder={placeholder}
                        InputAdornmentStart={
                            <InputComparisonDropdown
                                columnId={columnId}
                                filterComparison={filterComparison}
                                setFilterComparison={setFilterComparison}
                            />
                        }
                    />
                );
            }
        } else {
            console.log('hello', columnId, filter);
            return (
                <Input
                    value={filter ? filter.value.toString() : ''}
                    placeholder={placeholder}
                    onChange={e => setFilter(columnId, e.target.value)}
                />
            );
        }
    };

    return <Flex>{resolveComponent()}</Flex>;
};
