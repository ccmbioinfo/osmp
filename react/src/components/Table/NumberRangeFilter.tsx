import React, { useMemo, useState } from 'react';
import { Row } from 'react-table';
import { Column, Input, Typography } from '..';
import { DefaultFilter } from './ColumnFilter';
import {
    ComparisonType,
    FilterComparison,
    InputComparisonDropdown,
} from './InputComparisonDropdown';
import { FlattenedQueryResponse } from './Table';

interface NumberRangeFilterProps {
    setFilter: (columnId: string, filterValue: any) => void;
    filters: DefaultFilter[];
    columnId: keyof FilterComparison;
    preFilteredRows: Row<FlattenedQueryResponse>[];
}

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({
    setFilter,
    filters,
    columnId,
    preFilteredRows,
}) => {
    const [error, setError] = useState<boolean>(false);
    const [text, setText] = useState<string>('');

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

    const [min, max] = useMemo(() => {
        let min = preFilteredRows.length ? preFilteredRows[0].values[columnId] : 0;
        let max = preFilteredRows.length ? preFilteredRows[0].values[columnId] : 0;
        preFilteredRows.forEach(row => {
            min = Math.min(row.values[columnId], min);
            max = Math.max(row.values[columnId], max);
        });
        return [min, max];
    }, [columnId, preFilteredRows]);

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
            setError(false);
            const num = val === '' ? undefined : parseInt(val, 10);
            if (comparison.less) {
                setFilter(columnId, [-Infinity, num]);
            } else if (comparison.greater) {
                setFilter(columnId, [num, +Infinity]);
            } else {
                setFilter(columnId, [num, num]);
            }
        }
    };

    const filterValue = filters.find(f => f.id === columnId)?.value as Array<number>;
    console.log('filter value', filterValue);
    const comparison = filterComparison[columnId];

    const resolveComparisonComponent = () => {
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
        } else {
            return (
                <Input
                    variant="outlined"
                    value={filterValue ? filterValue[1] : text}
                    onChange={e => handleComparisonValue(columnId, e, comparison)}
                    placeholder="Search"
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
    };
    return (
        <Column>
            {resolveComparisonComponent()}
            {error && <Typography variant="subtitle">Please enter a valid number.</Typography>}
        </Column>
    );
};

export default NumberRangeFilter;
