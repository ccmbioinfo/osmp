import React, { useEffect, useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import { Column, Input, Typography } from '../..';
import { ComparisonType, InputComparisonDropdown } from './InputComparisonDropdown';

interface NumberRangeFilterProps {
    setFilter: (filterValue: any) => void;
}

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({ setFilter }) => {
    const [error, setError] = useState<boolean>(false);
    const [text, setText] = useState('');

    const [filterComparison, setFilterComparison] = useState<ComparisonType>({
        less: false,
        greater: false,
        equal: true,
    });

    const debouncedSetFilter = useAsyncDebounce((filterValue: any) => setFilter(filterValue), 500);

    const handleComparisonValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        const parsed = parseFloat(val);

        if (val === '') {
            setText(val);
        } else if (!parsed && parsed !== 0) {
            setError(true);
            setText(val);
        } else {
            setError(false);
            setText(parsed.toString());
        }
    };

    useEffect(() => {
        const parsed = parseFloat(text);

        if (text === '') debouncedSetFilter([-Infinity, Infinity]);
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
