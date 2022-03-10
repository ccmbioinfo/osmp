import React, { ChangeEvent, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { FaCaretDown } from 'react-icons/fa';
import styled from 'styled-components/macro';
import { Background, Typography } from '../components';
import { useClickAway } from '../hooks';
import { GeneSelectionValue } from './GeneSearch';
import Input, { InputProps } from './Input';
import { Flex } from './Layout';
import SelectableList, { SelectableListItem } from './SelectableList';
import Spinner from './Spinner';

interface ComboBoxProps<T> {
    options: SelectableListItem<T | T[]>[];
    loading?: boolean;
    onSelect: (item: T) => void;
    onChange?: (searchTerm: string) => void;
    placeholder: string;
    searchable?: boolean;
    isMulti?: boolean;
    selection?: T[];
    value: string;
}

export const Wrapper = styled(Flex)`
    position: relative
    min-height: 38px;
    flex-wrap: wrap;
    flex-grow: 0;
    position: relative;
    width: 100%;
`;

export const StyledInput = styled(Input)<InputProps>`
    cursor: ${props => (props.disabled ? 'pointer' : 'inherit')};
    outline: none;
    position: relative;
    padding: 0;
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
    width: inherit;
    padding: 0 ${props => props.theme.space[4]};
    flex-wrap: nowrap;
`;

/* Typeguard for type definition of option */
const isGene = (arg: any): arg is GeneSelectionValue =>
    typeof arg === 'object' && 'name' in arg && 'position' in arg;

export default function ComboBox<T extends {}>({
    options,
    loading,
    onChange,
    onSelect,
    placeholder,
    searchable,
    value,
    isMulti,
    selection,
}: ComboBoxProps<T>) {
    const [open, setOpen] = useState<Boolean>(false);

    if (searchable && !onChange) {
        console.error('An onChange function is required for searchable comboboxes!');
    }

    const ignoreRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;
    const ref = React.useRef() as React.MutableRefObject<HTMLUListElement>;

    useClickAway(ref, () => setOpen(false), ignoreRef);

    const getSuggestions = (e: ChangeEvent<HTMLInputElement>) => {
        setOpen(true);
        !!onChange && onChange(e.target.value);
    };

    return (
        <Wrapper ref={ignoreRef}>
            <Header tabIndex={0} role="button" onClick={() => setOpen(true)}>
                {searchable ? (
                    <>
                        <StyledInput
                            value={value}
                            placeholder={placeholder}
                            onChange={getSuggestions}
                        />
                        {loading ? <Spinner size={5} /> : <BsSearch />}
                    </>
                ) : (
                    <>
                        <StyledInput disabled value={value} placeholder={placeholder} />
                        <FaCaretDown />
                    </>
                )}
            </Header>
            {options.length > 1 && isGene(options[0].value) && open && (
                <Background
                    variant="success"
                    style={{
                        padding: '0rem 0.75rem',
                    }}
                >
                    <Typography variant="subtitle" success bold>
                        {options.length} gene aliases are found. Please select the appropriate gene.
                    </Typography>
                </Background>
            )}
            {open && (
                <SelectableList
                    ref={ref}
                    isMulti={isMulti}
                    selection={selection}
                    options={options}
                    onSelect={item => {
                        onSelect(item as T);
                        if (!isMulti) {
                            setOpen(false);
                        }
                    }}
                />
            )}
        </Wrapper>
    );
}
