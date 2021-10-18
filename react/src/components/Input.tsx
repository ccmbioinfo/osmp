import React from 'react';
import styled from 'styled-components';

export interface InputProps {
    disabled?: boolean;
    error?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: number | string;
    InputAdornmentStart?: React.ReactNode;
}

const Container = styled.div<InputProps>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    background-color: ${props => props.theme.background.main};
    border-color: ${props =>
        props.error ? props.theme.colors.error : props.theme.colors.muted} !important;
    color: ${props => props.theme.colors.text};
    border-radius: ${props => props.theme.radii.base};
    border: ${props => props.theme.borders.thin};
    box-shadow: ${props => props.theme.boxShadow};
    padding: ${props => props.theme.space[0]} ${props => props.theme.space[4]};
    font-family: ${props => props.theme.fontFamily.body};
    font-size: ${props => props.theme.fontSizes.s};
    min-height: 46px;
`;

const TextInput = styled.input`
    border: none;
    &:focus {
        outline: none;
    }
`;

const Input: React.FC<InputProps> = props => (
    <Container {...props}>
        {props.InputAdornmentStart && props.InputAdornmentStart}
        <TextInput />
    </Container>
);

export default Input;
