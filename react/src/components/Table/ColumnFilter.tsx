import React, { useState } from 'react';
import { Row } from 'react-table';
import { Column, Flex, Input, Typography } from '..';
import CHROMOSOMES from '../../constants/chromosomes';
import SOURCES from '../../constants/sources';
import ComboBox from '../ComboBox';
import SelectionFilter from './SelectionFilter';
import {
    ComparisonType,
    FilterComparison,
    InputComparisonDropdown,
} from './InputComparisonDropdown';
import { FlattenedQueryResponse } from './Table';

export type DefaultFilter = {
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
    const [error, setError] = useState<boolean>(false);
    const [text, setText] = useState<string>('');
    console.log(text);

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

    const handleComparisonValue = (
        columnId: string,
        e: React.ChangeEvent<HTMLInputElement>,
        comparison: ComparisonType
    ) => {
        const val = e.target.value;
        console.log('this is val', val, isNaN(parseInt(val)));
        if (isNaN(parseInt(val)) && val !== '') {
            console.log('wrong val', val);
            setError(true);
            setText(val);
        } else {
            const num = val === '' ? undefined : parseInt(val, 10);
            if (comparison.less) {
                setFilter(columnId, [-Infinity, num]);
            } else if (comparison.greater) {
                setFilter(columnId, [num, +Infinity]);
            } else {
                console.log('hello', columnId, filter, val);
                setFilter(columnId, [num, num]);
            }
        }
    };

    const resolveComponent = () => {
        if (columnId === 'source') {
            return (
                <SelectionFilter
                    setFilter={setFilter}
                    columnId={columnId}
                    options={SOURCES}
                    filter={filter}
                />
            );
        } else if (columnId === 'chromosome') {
            return (
                <SelectionFilter
                    setFilter={setFilter}
                    columnId={columnId}
                    options={CHROMOSOMES}
                    filter={filter}
                />
            );
        } else if (columnId === 'start' || columnId === 'end') {
            const filterValue = filters.filter(f => f.id === columnId)[0]?.value as Array<number>;
            console.log('filter value', filterValue);
            const comparison = filterComparison[columnId];
            if (comparison.less) {
                return (
                    <Input
                        variant="outlined"
                        value={filterValue ? filterValue[1] : text}
                        onChange={e => handleComparisonValue(columnId, e, comparison)}
                        placeholder={`Max (${max})`}
                        InputAdornmentStart={
                            <InputComparisonDropdown
                                columnId={columnId}
                                filterComparison={filterComparison}
                                setFilterComparison={setFilterComparison}
                                setFilter={setFilter}
                            />
                        }
                    />
                );
            } else if (comparison.greater) {
                return (
                    <Input
                        variant="outlined"
                        value={filterValue ? filterValue[0] : text}
                        onChange={e => handleComparisonValue(columnId, e, comparison)}
                        placeholder={`Min (${min})`}
                        InputAdornmentStart={
                            <InputComparisonDropdown
                                columnId={columnId}
                                filterComparison={filterComparison}
                                setFilterComparison={setFilterComparison}
                                setFilter={setFilter}
                            />
                        }
                    />
                );
            } else if (comparison.equal) {
                return (
                    <Input
                        variant="outlined"
                        value={filterValue ? filterValue[1] : text}
                        onChange={e => handleComparisonValue(columnId, e, comparison)}
                        placeholder={placeholder}
                        InputAdornmentStart={
                            <InputComparisonDropdown
                                columnId={columnId}
                                filterComparison={filterComparison}
                                setFilterComparison={setFilterComparison}
                                setFilter={setFilter}
                            />
                        }
                    />
                );
            }
        } else {
            return (
                <Input
                    variant="outlined"
                    value={filter ? filter.value.toString() : ''}
                    placeholder={placeholder}
                    onChange={e => setFilter(columnId, e.target.value)}
                />
            );
        }
    };

    return (
        <Flex>
            <Column>
                {resolveComponent()}
                {error && (
                    <Typography variant="subtitle" error>
                        Please enter a valid value.
                    </Typography>
                )}
            </Column>
        </Flex>
    );
};
