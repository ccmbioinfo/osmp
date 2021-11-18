import React, { useEffect, useState } from 'react';
import { Column, Input, Typography } from '../..';
import { useDebounce } from '../../../hooks';
import { ComparisonType, InputComparisonDropdown } from './InputComparisonDropdown';

interface NumberRangeFilterProps {
    setFilter: (filterValue: any) => void;
}

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({ setFilter }) => {
    const [error, setError] = useState<boolean>(false);

    const [debouncedInput, text, setText] = useDebounce<string>('', 500);

    const [filterComparison, setFilterComparison] = useState<ComparisonType>({
        less: false,
        greater: false,
        equal: true,
    });

    const handleComparisonValue = (
        e: React.ChangeEvent<HTMLInputElement>,
        comparison: ComparisonType
    ) => {
        const val = e.target.value;

        const parsed = parseFloat(val);

        if (val === '') {
            setText(val);
        } else if (!parsed && parsed !== 0) {
            console.log(parsed);
            setError(true);
            setText(val);
        } else {
            setError(false);
            setText(parsed.toString());
        }
    };

    useEffect(() => {
        const parsed = parseFloat(debouncedInput);

        if (debouncedInput === '') setFilter([-Infinity, Infinity]);
        else {
            if (filterComparison.less) {
                setFilter([-Infinity, parsed]);
            } else if (filterComparison.greater) {
                setFilter([parsed, +Infinity]);
            } else {
                setFilter([parsed, parsed]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedInput, filterComparison]);

    return (
        <Column>
            <Input
                variant="outlined"
                value={text}
                onChange={e => handleComparisonValue(e, filterComparison)}
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
