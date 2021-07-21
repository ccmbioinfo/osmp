import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            primary: string;
        };
        typography: {
            p: TypographyProps;
            h3: TypographyProps;
        };
    }
}

interface TypographyProps {
    fontFamily: string;
    fontSize: string;
    fontWeight: number | string;
}
