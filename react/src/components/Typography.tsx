import React from 'react';
import styled, { useTheme } from 'styled-components';
import Theme from '../constants/theme';

interface TypographyOverrides {
    bold?: boolean;
}

type TagType = keyof typeof Theme.typography;

interface TypographyProps extends TypographyOverrides {
    variant: TagType;
}

const makeStyledTypography = (
    variant: TagType,
    styleOverrides: TypographyOverrides,
    theme: typeof Theme
) => {
    return styled[variant]`
        color: ${theme.colors.primary};
        font-weight: ${styleOverrides.bold ? 'bold' : 'normal'};
    `;
};

const Typography: React.FC<TypographyProps> = ({ variant, children, ...userStyles }) => {
    const theme = useTheme();
    const Component = makeStyledTypography(variant, userStyles, theme);
    return <Component>{children}</Component>;
};

export default Typography;
