import React, { useState } from 'react';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { DropdownItem } from '../../types';
import { Header, List, Title, Wrapper } from './DropdownStyled';

interface DropdownProps {
    title: string;
    items: DropdownItem[];
    multiSelect?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ items, multiSelect, title }) => {
    const [open, setOpen] = useState<Boolean>(false);
    const [selection, setSelection] = useState<DropdownItem[]>([]);

    const toggle = () => setOpen(!open);

    function handleOnClick(item: DropdownItem) {
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

    return (
        <Wrapper>
            <Header tabIndex={0} role="button" onClick={toggle}>
                <Title>{title}</Title>
                {open ? <ExpandLess /> : <ExpandMore />}
            </Header>
            {open && (
                <List>
                    {items.map(item => (
                        <li key={item.id}>
                            <button type="button" onClick={() => handleOnClick(item)}>
                                <span>{item.value}</span>
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
