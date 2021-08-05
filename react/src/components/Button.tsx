import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
    variant: string;
    onClick?: () => void;
    disabled?: boolean;
}

const Component = styled.button<ButtonProps>`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 40px;
    text-align: center;
    font-family: ${props => props.theme.fontFamily.heading};
    padding: ${props => props.theme.space[3]} ${props => props.theme.space[4]};
    margin: ${props => props.theme.space[3]} ${props => props.theme.space[2]};
    color: ${props =>
        props.variant === 'primary' ? props.theme.colors.background : props.theme.colors.primary};
    background-color: ${props =>
        props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.background};
    border: ${props => props.theme.borders.thin};
    border-color: ${props => props.theme.colors.primary};
    border-radius: ${props => props.theme.radii.base};
    font-size: ${props => props.theme.fontSizes.s};
    text-decoration: none;
    &:hover:not(:disabled) {
        outline: 0;
        color: ${props => props.theme.colors.background};
        border-color: ${props => props.theme.colors.accent};
        background-color: ${props => props.theme.colors.accent};
        cursor: pointer;
    }
    &:disabled {
        opacity: 0.6;
        filter: saturate(60%);
    }
`;

const Button: React.FC<ButtonProps> = ({ variant, children, onClick, ...userStyles }) => {
    return (
        <Component variant={variant} onClick={onClick} {...userStyles}>
            {children}
        </Component>
    );
};

export default Button;
