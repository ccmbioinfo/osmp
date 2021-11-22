import React, { useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import styled from 'styled-components/macro';
import { Flex, Input } from '../..';

interface GlobalFilterProps {
    filter: any;
    setFilter: (filterValue: any) => void;
}

const SearchInput = styled(Input)`
    margin: ${props => props.theme.space[3]};
    height: 100%;
`;

export const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
    const [input, setInput] = useState<string>('');

    const debouncedSetFilter = useAsyncDebounce((filterValue: any) => setFilter(filterValue), 500);

    const handleChange = (val: string) => {
        debouncedSetFilter(val);
        setInput(val);
    };

    return (
        <Flex>
            <SearchInput
                variant="outlined"
                value={input}
                placeholder="Search All Columns..."
                onChange={e => handleChange(e.target.value)}
            />
        </Flex>
    );
};
