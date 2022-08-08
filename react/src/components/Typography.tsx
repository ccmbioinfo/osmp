import React from 'react';
import styled from 'styled-components/macro';
import Theme from '../constants/theme';

interface TypographyOverrides {
    bold?: boolean;
    condensed?: boolean;
    error?: boolean;
    success?: boolean;
    lineHeight?: number;
    customMargin?: boolean;
}

type TagType = keyof typeof Theme.typography;

interface TypographyProps extends TypographyOverrides {
    variant: TagType;
}

const Component = styled.p<TypographyProps>`
    user-select: text;
    ${props => !props.customMargin && `margin-inline-end: ${props.theme.space[2]};`}
    margin: ${props =>
        props.customMargin ? '20px 300px 20px 0px' : props.condensed ? '0' : 'revert'};
    color: ${props =>
        props.error
            ? props.theme.colors.error
            : props.success
            ? props.theme.colors.success
            : 'inherit'};
    font-weight: ${(props: TypographyOverrides) => (props.bold ? 'bold' : 'normal')};
    font-size: ${props => {
        switch (props.variant) {
            case 'subtitle':
                return props.theme.fontSizes.xs;
            case 'p':
                return props.theme.fontSizes.s;
            case 'h4':
                return props.theme.fontSizes.m;
            case 'h3':
                return props.theme.fontSizes.l;
        }
    }};
    font-family: ${props => {
        switch (props.variant) {
            case 'subtitle' || 'p':
                return props.theme.fontFamily.body;
            case 'h4':
                return props.theme.fontFamily.heading;
            case 'h3':
                return props.theme.fontFamily.heading;
        }
    }};
    line-height: ${props => props.lineHeight};
`;

const Typography: React.FC<TypographyProps> = ({ variant, children, ...userStyles }) => {
    return (
        <Component variant={variant} {...userStyles}>
            {children}
        </Component>
    );
};

export default Typography;
