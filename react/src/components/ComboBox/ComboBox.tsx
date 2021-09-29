import React, { ChangeEvent, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import styled from 'styled-components';
import { useClickAway } from '../../hooks';
import Input from '../Input';
import { Flex } from '../Layout';
import SelectableList, { SelectableListItem } from '../SelectableList';
import Spinner from '../Spinner';

//import { Header, Input, Wrapper } from './ComboBox.styles';

interface ComboBoxProps<T> {
    options: SelectableListItem<T>[];
    loading?: boolean;
    onSelect: (item: T) => void;
    onChange: (searchTerm: string) => void;
    placeholder: string;
    value: string;
}

export const Wrapper = styled(Flex)`
    min-height: 38px;
    flex-wrap: wrap;
    flex-grow: 0;
    max-width: 213px;
    position: relative;
    width: 100%;
`;

export const StyledInput = styled(Input)`
    border: none;
    box-shadow: transparent 0px 0px !important;
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

export default function ComboBox<T extends {}>({
    options,
    loading,
    onChange,
    onSelect,
    placeholder,
    value,
}: ComboBoxProps<T>) {
    const [open, setOpen] = useState<Boolean>(false);

    const ref = React.useRef() as React.MutableRefObject<HTMLDivElement>;

    useClickAway(ref, () => setOpen(false));

    const getSuggestions = (e: ChangeEvent<HTMLInputElement>) => {
        setOpen(true);
        onChange(e.target.value);
    };

    return (
        <Wrapper ref={ref}>
            <Header tabIndex={0} role="button">
                <StyledInput value={value} placeholder={placeholder} onChange={getSuggestions} />
                {loading ? <Spinner size={5} /> : <BsSearch />}
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
