import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
    onClick: () => void;
    command: string;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, command, disabled }) => {
    return (
        <ButtonStyled onClick={onClick} disabled={disabled}>
            {command}
        </ButtonStyled>
    );
};

const ButtonStyled = styled.button`
    box-sizing: border-box;
    display: inline-block;
    text-align: center;
    margin: 15px 5px;
    padding: 8px 16px;
    color: white;
    background-color: rebeccapurple;
    border: 1px solid;
    border-color: rebeccapurple;
    border-radius: 5px;
    font-family: sans-serif;
    font-size: 14px;
    text-decoration: none;
    &:hover:not(:disabled),
    &:active:not(:disabled),
    &:focus {
        outline: 0;
        color: white;
        border-color: salmon;
        background-color: salmon;
        cursor: pointer;
    }
    &:disabled {
        opacity: 0.6;
        filter: saturate(60%);
    }
`;
export default Button;
