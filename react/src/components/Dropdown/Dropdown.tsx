import React, { ChangeEvent, useEffect, useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { useClickAway } from '../../hooks';
import { DropdownItem } from '../../types';
import { Input, Header, List, Title, Wrapper } from './Dropdown.styles';

interface DropdownProps {
    title: string;
    items: DropdownItem[];
    onChange: (item: DropdownItem) => void;
    reset?: Boolean;
    multiSelect?: boolean;
    searchable?: boolean;
    value?: string | number;
}

const Dropdown: React.FC<DropdownProps> = ({
    items,
    multiSelect,
    title,
    reset,
    searchable,
    value,
    onChange,
}) => {
    const [text, setText] = useState(value);
    const [open, setOpen] = useState<Boolean>(false);
    const [selection, setSelection] = useState<DropdownItem[]>([]);
    const [suggestions, setSuggestions] = useState<DropdownItem[]>(items);

    const toggle = () => setOpen(!open);

    const getSuggestions = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setText(value);
        setOpen(true);
        onChange({
            id: 1,
            value: value,
            label: value,
        });
        if (value.length > 0) {
            const regex = new RegExp(`^${value}`, 'i');
            const autocomplete = items.sort().filter((v: DropdownItem) => regex.test(v.label));
            setSuggestions(autocomplete);
        } else {
            setSuggestions(items);
        }
    };

    function handleOnClick(item: DropdownItem) {
        onChange(item);
        if (!selection.some(current => current.id === item.id)) {
            if (!multiSelect) {
                setSelection([item]);
            } else if (multiSelect) {
                setSelection([...selection, item]);
            }
        } else {
            let selectionAfterRemoval = selection;
            selectionAfterRemoval = selectionAfterRemoval.filter(current => current.id !== item.id);
            setSelection([...selectionAfterRemoval]);
        }
    }

    function isItemSelected(item: DropdownItem) {
        if (selection.find(current => current.id === item.id)) {
            return true;
        }
        return false;
    }

    useEffect(() => {
        if (reset) {
            setSelection([]);
        }
    }, [reset]);

    useEffect(() => {
        if (searchable && selection.length > 0) {
            setText(selection[0].value);
        }
    }, [selection]);

    useEffect(() => {
        setText(value);
    }, [value]);

    const fragmentRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
    useClickAway(fragmentRef, () => setOpen(false));

    return (
        <div ref={fragmentRef}>
            <Wrapper>
                <Header tabIndex={0} role="button" onClick={toggle}>
                    {searchable && !multiSelect ? (
                        <Input
                            value={text}
                            placeholder="Find chromosome..."
                            onChange={getSuggestions}
                        />
                    ) : (
                        <Title>
                            {selection.length > 0 ? selection.map(v => v.label).join(', ') : title}
                        </Title>
                    )}
                    {open ? <BsChevronUp /> : <BsChevronDown />}
                </Header>
                {open && (
                    <List>
                        {suggestions.map(item => (
                            <li key={item.id}>
                                <button type="button" onClick={() => handleOnClick(item)}>
                                    <span>{item.label}</span>
                                    <span>{isItemSelected(item) && 'Selected'}</span>
                                </button>
                            </li>
                        ))}
                    </List>
                )}
            </Wrapper>
        </div>
    );
};

export default Dropdown;
