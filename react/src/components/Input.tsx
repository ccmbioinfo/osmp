import React from 'react';
import styled from 'styled-components/macro';

export interface InputProps {
    disabled?: boolean;
    error?: boolean;
    variant?: 'outlined';
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: number | string;
    InputAdornmentStart?: React.ReactNode;
}

const Container = styled.div<Pick<InputProps, 'variant' | 'error'>>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    ${props => {
        switch (props.variant) {
            case 'outlined':
                return `
                border-radius: ${props.theme.radii.base};
                border: ${props.theme.borders.thin};
                box-shadow: ${props.theme.boxShadow};
                border-color: ${
                    props.error ? props.theme.colors.error : props.theme.colors.muted
                } !important;
                `;
            default:
                return '';
        }
    }}

    background-color: ${props => props.theme.background.main};
    color: ${props => props.theme.colors.text};

    padding: ${props => props.theme.space[0]} ${props => props.theme.space[4]};
    font-family: ${props => props.theme.fontFamily.body};
    font-size: ${props => props.theme.fontSizes.s};
    min-height: 46px;
`;

const TextInput = styled.input<InputProps>`
    border: none;
    &:focus {
        outline: none;
    }
`;

const Input: React.FC<InputProps> = props => (
    <Container variant={props.variant} error={props.error}>
        {props.InputAdornmentStart && props.InputAdornmentStart}
        <TextInput {...props} />
    </Container>
);

export default Input;
