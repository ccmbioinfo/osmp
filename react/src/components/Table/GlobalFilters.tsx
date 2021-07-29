import React, { useState } from 'react';
import { useAsyncDebounce } from 'react-table';

interface GlobalFilterProps {
    filter: any;
    setFilter: (filterValue: any) => void;
}

export const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
    const [value, setValue] = useState(filter);
    const onChange = useAsyncDebounce(value => {
        setFilter(value || undefined);
    }, 1000);
    return (
        <span>
            Search:{' '}
            <input
                value={value || ''}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
            />
        </span>
    );
};
