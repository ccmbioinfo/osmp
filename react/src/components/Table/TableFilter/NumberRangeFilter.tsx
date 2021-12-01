import React, { useEffect, useState } from 'react';
import { IdType, useAsyncDebounce, UseFiltersInstanceProps } from 'react-table';
import { Column, Input, Typography } from '../..';
import { ComparisonType, InputComparisonDropdown } from './InputComparisonDropdown';

interface NumberRangeFilterProps<T extends {}>
    extends Pick<UseFiltersInstanceProps<T>, 'setFilter'> {
    columnId: IdType<T>;
}

export default function NumberRangeFilter<T extends {}>({
    setFilter,
    columnId,
}: NumberRangeFilterProps<T>) {
    const [error, setError] = useState<boolean>(false);
    const [text, setText] = useState('');

    const [filterComparison, setFilterComparison] = useState<ComparisonType>({
        less: false,
        greater: false,
        equal: true,
    });

    const debouncedSetFilter = useAsyncDebounce(
        (filterValue: any) => setFilter(columnId, filterValue),
        500
    );

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

        if (!parsed) debouncedSetFilter([-Infinity, Infinity]);
        else {
            if (filterComparison.less) {
                debouncedSetFilter([-Infinity, parsed]);
            } else if (filterComparison.greater) {
                debouncedSetFilter([parsed, +Infinity]);
            } else {
                debouncedSetFilter([parsed, parsed]);
            }
        }
    }, [text, debouncedSetFilter, filterComparison.less, filterComparison.greater]);

    return (
        <Column>
            <Input
                variant="outlined"
                value={text}
                onChange={e => handleComparisonValue(e)}
                placeholder="Search"
                InputAdornmentStart={
                    <InputComparisonDropdown
                        columnId={columnId}
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
}
