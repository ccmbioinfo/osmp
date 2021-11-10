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

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({ setFilter, filters, columnId }) => {
    const [error, setError] = useState<boolean>(false);
    const [text, setText] = useState<string>('');

    // If we have more columns we want to add number comparison too, they would be added to this list.
    // todo: move to a declarative model on the Column def
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
        af: {
            less: false,
            greater: false,
            equal: true,
        },
        gnomadHom: {
            less: false,
            greater: false,
            equal: true,
        },
    });

    const handleComparisonValue = (
        columnId: string,
        e: React.ChangeEvent<HTMLInputElement>,
        comparison: ComparisonType
    ) => {
        const val = e.target.value;

        const parsed = parseFloat(val);

        if (val === '') {
            setText(val);
            setFilter(columnId, [-Infinity, Infinity]);
        } else if (!parsed) {
            setError(true);
            setText(val);
        } else {
            setError(false);
            setText(parsed.toString());
            if (comparison.less) {
                setFilter(columnId, [-Infinity, parsed]);
            } else if (comparison.greater) {
                setFilter(columnId, [parsed, +Infinity]);
            } else {
                setFilter(columnId, [parsed, parsed]);
            }
        }
    };

    const comparison = filterComparison[columnId];

    return comparison ? (
        <Column>
            <Input
                variant="outlined"
                value={text}
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
    ) : null;
};

export default NumberRangeFilter;
