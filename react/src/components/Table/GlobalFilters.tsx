import React, { useState } from 'react';
import { useAsyncDebounce } from 'react-table';
import styled from 'styled-components';
import { Flex, Input, Typography } from '../index';

interface GlobalFilterProps {
    filter: any;
    setFilter: (filterValue: any) => void;
}

const SearchInput = styled(Input)`
    margin: ${props => props.theme.space[3]};
    min-height: 30px;
`;

export const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
    const [value, setValue] = useState(filter);
    const onChange = useAsyncDebounce(value => {
        setFilter(value || undefined);
    }, 1000);
    return (
        <Flex>
            <Typography variant="p">Search</Typography>
            <SearchInput
                value={value || ''}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
            />
        </Flex>
    );
};
