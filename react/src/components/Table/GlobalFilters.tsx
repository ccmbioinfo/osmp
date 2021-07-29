import React, { useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import styled from 'styled-components';
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
    const [value, setValue] = useState(filter);
    const onChange = useAsyncDebounce(value => {
        setFilter(value || undefined);
    }, 1000);
    return (
        <Flex>
            <SearchInput
                value={value || ''}
                placeholder="Search All Columns..."
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
            />
        </Flex>
    );
};
