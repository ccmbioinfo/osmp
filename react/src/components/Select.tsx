import React, { useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import styled from 'styled-components';
import { useClickAway } from '../hooks';
import Input from './Input';
import { Flex } from './Layout';
import SelectableList, { SelectableListItem } from './SelectableList';

interface SelectProps<T extends {}> {
    onSelect: (val: T) => void;
    options: SelectableListItem<T>[];
    selectedLabel: string;
}

const Wrapper = styled(Flex)`
    min-height: 38px;
    flex-wrap: wrap;
    flex-grow: 0;
    max-width: 213px;
    position: relative;
    width: 100%;
`;

const StyledInput = styled(Input)`
    border: none;
    box-shadow: transparent 0px 0px !important;
    cursor: pointer;
    outline: none;
    width: 70%;
`;

export const Header = styled(Flex)`
    align-items: center;
    background-color: ${props => props.theme.background.main};
    border: ${props => props.theme.borders.thin};
    border-color: ${props => props.theme.colors.muted};
    border-radius: ${props => props.theme.radii.base};
    box-shadow: ${props => props.theme.boxShadow};
    color: ${props => props.theme.colors.muted};
    justify-content: space-between;
    padding: ${props => props.theme.space[0]} ${props => props.theme.space[4]};
    width: inherit;
`;

export default function Select<T>({ onSelect, options, selectedLabel }: SelectProps<T>) {
    const [open, setOpen] = useState(false);

    const ref = React.useRef() as React.MutableRefObject<HTMLDivElement>;

    useClickAway(ref, () => setOpen(false));

    return (
        <Wrapper ref={ref}>
            <Header onClick={() => setOpen(!open)}>
                <StyledInput disabled value={selectedLabel} placeholder="Select" />
                <FaCaretDown />
            </Header>
            {open && (
                <SelectableList
                    options={options}
                    onSelect={item => {
                        onSelect(item as T);
                        setOpen(false);
                    }}
                />
            )}
        </Wrapper>
    );
}
