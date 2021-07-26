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
    color: ${props => (props.error ? props.theme.colors.error : props.theme.colors.text)};
    font-weight: ${(props: TypographyOverrides) => (props.bold ? 'bold' : 'normal')};
    font-size: ${props => {
        switch (props.variant) {
            case 'p':
                return props.theme.fontSizes.s;
            case 'h4':
                return props.theme.fontSizes.m;
            case 'h3':
                return props.theme.fontSizes.l;
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
