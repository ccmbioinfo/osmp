import React, { useState } from 'react';
import { FaCaretDown } from 'react-icons/fa';
import styled from 'styled-components';
import { useClickAway } from '../hooks';
import Input from './Input';
import { Flex } from './Layout';
import SelectableList, { SelectableListItem } from './SelectableList';

interface SelectProps<T extends {}> {
    onChange: (val: T) => void;
    options: SelectableListItem<T>[];
    selectedLabel: string;
}

const Wrapper = styled(Flex)`
    min-height: 38px;
    flex-wrap: wrap;
    flex-grow: 0;
    position: relative;
    width: 213px;
`;

const StyledInput = styled(Input)`
    box-shadow: transparent 0px 0px !important;
    cursor: pointer;
    width: 70%;
    border: none;
    outline: none;
`;

export const Header = styled(Flex)`
    background-color: ${props => props.theme.background.main};
    border-color: ${props => props.theme.colors.muted};
    color: ${props => props.theme.colors.muted};
    border-radius: ${props => props.theme.radii.base};
    border: ${props => props.theme.borders.thin};
    box-shadow: ${props => props.theme.boxShadow};
    padding: ${props => props.theme.space[0]} ${props => props.theme.space[4]};
    justify-content: space-between;
    align-items: center;
    width: inherit;
`;

export default function Select<T>({ onChange, options, selectedLabel }: SelectProps<T>) {
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
                        onChange(item as T);
                        setOpen(false);
                    }}
                />
            )}
        </Wrapper>
    );
}
