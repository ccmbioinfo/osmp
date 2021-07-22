import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        palette: {
            primary: string;
            typography: {
                main: string;
                error: string;
            };
        };
        typography: {
            p: TypographyProps;
            h3: TypographyProps;
            h4: TypographyProps;
        };
    }
}

interface TypographyProps {
    fontFamily: string;
    fontSize: string;
    fontWeight: number | string;
}
