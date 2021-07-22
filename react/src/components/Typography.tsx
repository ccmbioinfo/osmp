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

/* todo: reduce duplication... */
const styledTypographyMap = {
    p: styled.p`
        color: ${props =>
            props.error
                ? props.theme.palette.typography.error
                : props.theme.palette.typography.main};
        font-weight: ${(props: TypographyOverrides) => (props.bold ? 'bold' : 'normal')};
    `,
    h3: styled.h3`
        color: ${props => props.theme.palette.typography.main};
        font-weight: ${(props: TypographyOverrides) => (props.bold ? 'bold' : 'normal')};
    `,
    h4: styled.h4`
        color: ${props => props.theme.palette.typography.main};
        font-weight: ${(props: TypographyOverrides) => (props.bold ? 'bold' : 'normal')};
    `,
};

const Typography: React.FC<TypographyProps> = ({ variant, children, ...userStyles }) => {
    const Component = styledTypographyMap[variant];
    return <Component {...userStyles}>{children}</Component>;
};

export default Typography;
