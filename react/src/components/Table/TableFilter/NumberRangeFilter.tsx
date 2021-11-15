import React, { useState } from 'react';
import { Column, Input, Typography } from '../..';
import { ComparisonType, InputComparisonDropdown } from './InputComparisonDropdown';

interface NumberRangeFilterProps {
    setFilter: (filterValue: any) => void;
}

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({ setFilter }) => {
    const [error, setError] = useState<boolean>(false);
    const [text, setText] = useState<string>('');

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
            setFilter([-Infinity, Infinity]);
        } else if (!parsed) {
            setError(true);
            setText(val);
        } else {
            setError(false);
            setText(parsed.toString());
            if (comparison.less) {
                setFilter([-Infinity, parsed]);
            } else if (comparison.greater) {
                setFilter([parsed, +Infinity]);
            } else {
                setFilter([parsed, parsed]);
            }
        }
    };

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
