import React, { useState } from 'react';
import styled from 'styled-components';
import { Flex, Input } from '../index';

interface ColumnFilterProps {
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
}

const SearchInput = styled(Input)`
    min-height: 30px;
`;

export const ColumnFilter: React.FC<ColumnFilterProps> = ({ setFilter, columnId }) => {
    const [value, setValue] = useState('');
    return (
        <Flex>
            <SearchInput
                value={value}
                placeholder={columnId}
                onChange={e => {
                    setFilter(columnId, e.target.value);
                    setValue(e.target.value);
                }}
            />
        </Flex>
    );
};
