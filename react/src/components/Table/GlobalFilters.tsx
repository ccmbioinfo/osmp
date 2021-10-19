import React from 'react';
import { useAsyncDebounce } from 'react-table';
import styled from 'styled-components/macro';
import { Flex, Input } from '../index';

interface GlobalFilterProps {
    filter: any;
    setFilter: (filterValue: any) => void;
}

const SearchInput = styled(Input)`
    margin: ${props => props.theme.space[3]};
    height: 100%;
`;

export const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
    const handleChange = useAsyncDebounce(value => {
        setFilter(value || undefined);
    }, 10);
    return (
        <Flex>
            <SearchInput
                variant="outlined"
                value={filter || ''}
                placeholder="Search All Columns..."
                onChange={e => handleChange(e.target.value)}
            />
        </Flex>
    );
};
