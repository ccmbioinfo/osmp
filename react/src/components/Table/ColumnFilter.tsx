import { Flex, Input } from '..';
import SOURCES from '../../constants/sources';
import ComboBox from '../ComboBox';

interface ColumnFilterProps {
    filters: {
        id: string;
        value: string | number;
    }[];
    setFilter: (columnId: string, filterValue: any) => void;
    columnId: string;
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({ filters, setFilter, columnId }) => {
    const filter = filters.find(f => f.id === columnId);

    const placeholder = 'Search';

    const resolveComponent = () => {
        if (columnId === 'source') {
            return (
                <ComboBox
                    options={SOURCES.map((n, id) => ({
                        id,
                        value: n,
                        label: n,
                    })).concat({ id: 3, label: 'all', value: '' })}
                    onSelect={val => setFilter('source', val)}
                    placeholder="Select"
                    value={filter ? filter.value.toString() : ''}
                />
            );
        } else {
            return (
                <Input
                    value={filter ? filter.value.toString() : ''}
                    placeholder={placeholder}
                    onChange={e => setFilter(columnId, e.target.value)}
                />
            );
        }
    };

    return <Flex>{resolveComponent()}</Flex>;
};
