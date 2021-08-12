import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
    variant: 'primary' | 'secondary' | 'light';
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
    border: ${props => props.theme.borders.thin};
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

    ${props => {
        switch (props.variant) {
            case 'primary':
                return `
                    color: ${props.theme.colors.background};
                    background-color: ${props.theme.colors.primary};
                    border-color: ${props.theme.colors.primary};
                `;
            case 'secondary':
                return `
                    color: ${props.theme.colors.primary};
                    background-color: ${props.theme.colors.background};
                    border-color: ${props.theme.colors.primary};
                `;
            case 'light':
                return `
                    color: ${props.theme.colors.text};
                    background-color: ${props.theme.colors.disabled};
                    border: none;
                `;
        }
    }}
`;

const Button: React.FC<ButtonProps> = ({ variant, children, onClick, ...userStyles }) => {
    return (
        <Component variant={variant} onClick={onClick} {...userStyles}>
            {children}
        </Component>
    );
};

export default Button;
