import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components/macro';

const Component = styled.button<ButtonProps>`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: ${props => props.fluid && '1'};
    text-align: center;
    font-family: ${props => props.theme.fontFamily.heading};
    padding: ${props => props.theme.space[3]} ${props => props.theme.space[4]};
    margin-inline: ${props => props.theme.space[2]};
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
                    min-height: 40px;
                    color: ${props.theme.colors.background};
                    background-color: ${props.theme.colors.primary};
                    border-color: ${props.theme.colors.primary};
                `;
            case 'secondary':
                return `
                    min-height: 40px;
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

export interface ButtonProps {
    variant: 'primary' | 'secondary' | 'light';
    fluid?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
    keyCodes?: string[]; // run onClick if these keys are pressed
    disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    const { variant, onClick, children, ...userStyles } = props;

    const listener = useCallback(
        ({ code }: KeyboardEvent) => {
            if (props.keyCodes?.includes(code)) onClick!();
        },
        [onClick, props.keyCodes]
    );

    useEffect(() => {
        if (!onClick || props.disabled || !props.keyCodes?.length) return;

        document.addEventListener('keydown', listener);

        return () => document.removeEventListener('keydown', listener);
    }, [listener, onClick, props.disabled, props.keyCodes]);

    return (
        <Component ref={ref} variant={variant} onClick={onClick} {...userStyles}>
            {children}
        </Component>
    );
});

export default Button;
