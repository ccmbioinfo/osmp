import React, { useState } from 'react';
import { Row } from 'react-table';
import { Flex, Input } from '..';
import CHROMOSOMES from '../../constants/chromosomes';
import SOURCES from '../../constants/sources';
import ComboBox from '../ComboBox';
import { FlattenedQueryResponse } from './Table';

/* eslint-disable @typescript-eslint/no-unused-vars */

type ComparisonType = {
    less: boolean;
    greater: boolean;
    equal: boolean;
};

type ComparisonOption = {
    id: number;
    value: keyof ComparisonType;
    label: string;
};

type DefaultFilter = {
    id: string;
    value: string | number;
};

type FilterWithComparison = Array<number>;

interface FilterComparison {
    start: ComparisonType;
    end: ComparisonType;
}

interface ColumnFilterProps {
    filters: DefaultFilter[] | FilterWithComparison;
    preFilteredRows: Row<FlattenedQueryResponse>[];
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
}

interface InputComparisonDropdownProps {
    columnId: keyof FilterComparison;
    filterComparison: FilterComparison;
    setFilterComparison: React.Dispatch<React.SetStateAction<FilterComparison>>;
}

export const InputComparisonDropdown: React.FC<InputComparisonDropdownProps> = ({
    columnId,
    filterComparison,
    setFilterComparison,
}) => {
    const [sign, setSign] = useState<keyof ComparisonType>('equal');

    const COMPARISON_OPTIONS: ComparisonOption[] = [
        {
            id: 1,
            value: 'less',
            label: '<',
        },
        {
            id: 2,
            value: 'greater',
            label: '>',
        },
        {
            id: 3,
            value: 'equal',
            label: '=',
        },
    ];

    return (
        <ComboBox
            options={COMPARISON_OPTIONS}
            onSelect={value => {
                setSign(value);
                if (columnId in filterComparison && value in filterComparison[columnId]) {
                    const newComparison = filterComparison;
                    Object.keys(newComparison[columnId]).forEach(v => {
                        newComparison[columnId][v as keyof ComparisonType] =
                            v === value ? true : false;
                    });
                    setFilterComparison(newComparison);
                }
            }}
            placeholder="Search"
            value={sign}
        />
    );
};

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

    const filter = (filters as DefaultFilter[]).find(f => f.id === columnId);

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
            const filterValue = filters as FilterWithComparison;
            const comparison = filterComparison[columnId];
            console.log('comparison', comparison);
            if (comparison.less) {
                return (
                    <Input
                        value={filterValue[1] || ''}
                        onChange={e => {
                            const val = e.target.value;
                            setFilter(columnId, (old = []) => [
                                old[0],
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
                        value={filterValue[1] || ''}
                        onChange={e => {
                            const val = e.target.value;
                            setFilter(columnId, (old = []) => [
                                val ? parseInt(val, 10) : undefined,
                                old[1],
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
                        value={filterValue[1] || ''}
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
