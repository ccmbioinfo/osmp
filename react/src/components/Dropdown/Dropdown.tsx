import React, { useEffect, useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { DropdownItem } from '../../types';
import { Header, List, Title, Wrapper } from './Dropdown.styles';

interface DropdownProps {
    title: string;
    items: DropdownItem[];
    onChange: (item: DropdownItem) => void;
    reset?: Boolean;
    multiSelect?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ items, multiSelect, title, reset, onChange }) => {
    const [open, setOpen] = useState<Boolean>(false);
    const [selection, setSelection] = useState<DropdownItem[]>([]);

    const toggle = () => setOpen(!open);

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

    return (
        <Wrapper>
            <Header tabIndex={0} role="button" onClick={toggle}>
                <Title>
                    {selection.length > 0 ? selection.map(v => v.label).join(', ') : title}
                </Title>
<<<<<<< HEAD:react/src/components/Filters/Dropdown.tsx
                {open ? 'lss' : 'mrrr'}
=======
                {open ? <BsChevronUp /> : <BsChevronDown />}
>>>>>>> develop:react/src/components/Dropdown/Dropdown.tsx
            </Header>
            {open && (
                <List>
                    {items.map(item => (
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
    );
};

export default Dropdown;
