import React, { useEffect, useMemo, useState } from 'react';
import { useAsyncDebounce, UseFiltersColumnProps } from 'react-table';
import { Column, Input, Typography } from '../..';
import { DefaultFilter } from './ColumnFilter';
import { ComparisonType, InputComparisonDropdown } from './InputComparisonDropdown';

interface NumberRangeFilterProps<T extends {}> extends Pick<UseFiltersColumnProps<T>, 'setFilter'> {
    filter: DefaultFilter<number[]>;
}

export default function NumberRangeFilter<T extends {}>({
    filter,
    setFilter,
}: NumberRangeFilterProps<T>) {
    /*
     * For number filtering, react-table records the number range as an array of the upper and lower bound. 
        e.g. >2, <2, and =2 is represented as [2, undefined], [undefined, 2], and [2,2] respectively.
     */

    const [lower, upper] = filter ? filter.value : [];

    const value = useMemo(() => (lower || upper || '').toString(), [lower, upper]);

    const comparison = useMemo(
        () => ({
            less: lower === undefined && upper !== undefined,
            greater: upper === undefined && lower !== undefined,
            equal: upper === lower,
        }),
        [lower, upper]
    );

    const [error, setError] = useState<boolean>(false);
    const [text, setText] = useState(value);

    const [filterComparison, setFilterComparison] = useState<ComparisonType>(comparison);

    const debouncedSetFilter = useAsyncDebounce((filterValue: any) => setFilter(filterValue), 500);

    const handleComparisonValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '' || /^0?\.0*$/.test(val)) {
            return setText(val);
        }

        const parsed = parseFloat(val);

        if (!parsed && parsed !== 0) {
            setError(true);
            return setText(val);
        } else {
            setError(false);
            return setText(parsed.toString());
        }
    };

    useEffect(() => {
        const parsed = parseFloat(text);

        if (!parsed) debouncedSetFilter([undefined, undefined]);
        else {
            if (filterComparison.less) {
                debouncedSetFilter([undefined, parsed]);
            } else if (filterComparison.greater) {
                debouncedSetFilter([parsed, undefined]);
            } else {
                debouncedSetFilter([parsed, parsed]);
            }
        }
    }, [text, debouncedSetFilter, filterComparison.less, filterComparison.greater]);

    useEffect(() => {
        if (!filter) setText('');
    }, [filter, setText]);

    return (
        <Column>
            <Input
                variant="outlined"
                value={text}
                onChange={e => handleComparisonValue(e)}
                placeholder="Search"
                InputAdornmentStart={
                    <InputComparisonDropdown
                        setFilterComparison={setFilterComparison}
                        setFilter={setFilter}
                        comparison={filterComparison}
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
}
