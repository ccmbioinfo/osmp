import React, { ChangeEvent, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { Spinner } from '..';
import { useClickAway } from '../../hooks';
import SelectableList, { SelectableListItem } from '../SelectableList';
import { Header, Input, Wrapper } from './ComboBox.styles';

interface ComboBoxProps<T> {
    items: SelectableListItem<T>[];
    loading?: boolean;
    onSelect: (item: T) => void;
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

    function handleOnClick(item: T) {
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
        <div ref={fragmentRef}>
            <Wrapper>
                <Header tabIndex={0} role="button">
                    <Input value={value} placeholder={placeholder} onChange={getSuggestions} />
                    {loading ? <Spinner size={5} /> : <BsSearch />}
                </Header>
                {open && (
                    <SelectableList
                        options={items.filter(i =>
                            i.label.toLowerCase().includes(value.toLowerCase())
                        )}
                        onSelect={item => handleOnClick(item as T)}
                    />
                )}
            </Wrapper>
        </div>
    );
}

export default ComboBox;
