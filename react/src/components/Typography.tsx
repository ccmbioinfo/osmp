import React from 'react';
import styled from 'styled-components';
import Theme from '../constants/theme';

interface TypographyOverrides {
    bold?: boolean;
    error?: boolean;
}

type TagType = keyof typeof Theme.typography;

interface TypographyProps extends TypographyOverrides {
    variant: TagType;
}

const Component = styled.p<TypographyProps>`
    margin-inline-start: ${props => props.theme.space[2]};
    margin-inline-end: ${props => props.theme.space[2]};
    color: ${props => (props.error ? props.theme.colors.error : props.theme.colors.text)};
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
`;

const Typography: React.FC<TypographyProps> = ({ variant, children, ...userStyles }) => {
    return (
        <Component variant={variant} {...userStyles}>
            {children}
        </Component>
    );
};

export default Typography;
