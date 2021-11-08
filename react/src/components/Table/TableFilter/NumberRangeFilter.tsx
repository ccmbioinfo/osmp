import React, { useState } from 'react';
import { Row } from 'react-table';
import { Column, Input, Typography } from '../..';
import { FlattenedQueryResponse } from '../Table';
import { DefaultFilter } from './ColumnFilter';
import {
    ComparisonType,
    FilterComparison,
    InputComparisonDropdown,
} from './InputComparisonDropdown';

interface NumberRangeFilterProps {
    setFilter: (columnId: string, filterValue: any) => void;
    filters: DefaultFilter<number[]>[];
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

    // If we have more columns we want to add number comparison too, they would be added to this list.
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

    let num: number | undefined | string;
    const handleComparisonValue = (
        columnId: string,
        e: React.ChangeEvent<HTMLInputElement>,
        comparison: ComparisonType
    ) => {
        const val = e.target.value;

        // Check if input value is a float
        const hasDecimal = val.includes('.');
        const decimalValue = (hasDecimal ? val.split('.') : [val, ''])[1];
        const parsed = parseFloat(val).toFixed(decimalValue.length);

        if (isNaN(Number(parsed)) && val !== '') {
            setError(true);
            setText(val);
        } else {
            setError(false);
            if (val === '') {
                setText(val);
                num = undefined;
            } else if (hasDecimal && !decimalValue.length) {
                setText(val);
                num = undefined;
            } else {
                setText(parsed);
                num = parseFloat(parsed);
            }

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
    const comparison = filterComparison[columnId];

    const resolveComparisonValue = (comparison: ComparisonType) => {
        if (filterValue) {
            return comparison.less ? filterValue[1] : filterValue[0];
        }
        return text;
    };

    return (
        <Column>
            <Input
                variant="outlined"
                value={resolveComparisonValue(comparison)}
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
            {error && (
                <Typography variant="subtitle" bold error>
                    Please enter a valid number.
                </Typography>
            )}
        </Column>
    );
};

export default NumberRangeFilter;
