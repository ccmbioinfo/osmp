import React, { ChangeEvent, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { Spinner } from '..';
import { useClickAway } from '../../hooks';
import { DropdownItem } from '../../types';
import { Header, Input, List, Wrapper } from './ComboBox.styles';

interface ComboBoxProps<T> {
    items: DropdownItem<T>[];
    loading?: boolean;
    onSelect: (item: DropdownItem<T>) => void;
    onChange: (searchTerm: string) => void;
    onClose?: () => void;
    placeholder: string;
    value: string;
}

function ComboBox<T extends {}>({
    items,
    loading,
    onChange,
    onClose,
    onSelect,
    placeholder,
    value,
}: ComboBoxProps<T>) {
    const [open, setOpen] = useState<Boolean>(false);

    const getSuggestions = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setOpen(true);
        onChange(value);
    };

    function handleOnClick(item: DropdownItem<T>) {
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
                    <Input value={value} placeholder={placeholder} onChange={getSuggestions} />
                    {loading ? <Spinner size={5} /> : <BsSearch />}
                </Header>
                {open && (
                    <List ref={fragmentRef}>
                        {items
                            .filter(i => i.label.toLowerCase().includes(value.toLowerCase()))
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
}

export default ComboBox;
