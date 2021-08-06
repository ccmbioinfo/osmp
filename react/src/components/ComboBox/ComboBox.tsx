import React, { ChangeEvent, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { Spinner } from '..';
import { useClickAway } from '../../hooks';
import { DropdownItem } from '../../types';
import { Header, Input, List, Wrapper } from './ComboBox.styles';

interface ComboBoxProps {
    items: DropdownItem[];
    loading?: boolean;
    onSelect: (item: DropdownItem) => void;
    onChange?: (searchTerm: string) => void;
    onClose?: () => void;
    placeholder: string;
    value: string;
}

const ComboBox: React.FC<ComboBoxProps> = ({
    items,
    loading,
    onChange,
    onClose,
    onSelect,
    placeholder,
    value,
}) => {
    const [searchTerm, setSearchTerm] = useState(value);
    const [open, setOpen] = useState<Boolean>(false);

    const getSuggestions = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setOpen(true);
        if (onChange) {
            onChange(value);
        }
    };

    function handleOnClick(item: DropdownItem) {
        setSearchTerm(item.label);
        onSelect(item);
        setOpen(false);
    }

    const fragmentRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

    useClickAway(fragmentRef, () => {
        if (open && onClose) {
            onClose();
        }
        setOpen(false);
    });

    return (
        <div>
            <Wrapper>
                <Header tabIndex={0} role="button">
                    <Input value={searchTerm} placeholder={placeholder} onChange={getSuggestions} />
                    {loading ? <Spinner size={10} /> : <BsSearch />}
                </Header>
                {open && (
                    <List ref={fragmentRef}>
                        {items
                            .filter(i => i.label.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(item => (
                                <li key={item.id}>
                                    <button type="button" onClick={() => handleOnClick(item)}>
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                    </List>
                )}
            </Wrapper>
        </div>
    );
};

export default ComboBox;
