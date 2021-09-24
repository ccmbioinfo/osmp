import styled from 'styled-components';
import { Flex, Input } from '../index';

interface ColumnFilterProps {
    filters: {
        id: string;
        value: string | number;
    }[];
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
}

const SearchInput = styled(Input)`
    min-height: 30px;
`;

export const ColumnFilter: React.FC<ColumnFilterProps> = ({ filters, setFilter, columnId }) => {
    const value = filters.filter(f => f.id === columnId)[0]?.value;

    return (
        <Flex>
            <SearchInput
                value={value || ''}
                placeholder="Search"
                onChange={e => setFilter(columnId, e.target.value)}
            />
        </Flex>
    );
};
