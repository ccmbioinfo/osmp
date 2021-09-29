import React from 'react';
import styled from 'styled-components';
import StyledInput from './StyledInput';

export interface InputProps {
    disabled?: boolean;
    error?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: number | string;
}

const Component = styled(StyledInput)<InputProps>`
    border-color: ${props =>
        props.error ? props.theme.colors.error : props.theme.colors.muted} !important;
`;

const Input: React.FC<InputProps> = props => <Component {...props} />;

export default Input;
