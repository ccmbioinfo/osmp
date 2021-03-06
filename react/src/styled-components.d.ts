import 'styled-components/macro';

declare module 'styled-components/macro' {
    export interface DefaultTheme {
        background: {
            main: string;
            success: string;
            light: string;
            error: string;
        };
        boxShadow: string;
        colors: {
            text: string;
            background: string;
            primary: string;
            secondary: string;
            accent: string;
            muted: string;
            disabled: string;
            error: string;
            success: string;
            info: string;
            warning: string;
            shadow: string;
        };
        space: string[];
        fontFamily: {
            heading: string;
            body: string;
        };
        fontSizes: {
            xl: string;
            l: string;
            m: string;
            s: string;
            xs: string;
        };
        fontWeights: {
            light: number;
            normal: number;
            bold: number;
        };
        lineHeights: {
            body: number;
            heading: number;
        };
        borders: {
            none: string;
            thin: string;
        };
        radii: {
            none: number;
            base: string;
            round: string;
        };
        typography: {
            p: TypographyProps;
            h3: TypographyProps;
            h4: TypographyProps;
            subtitle: TypographyProps;
        };
    }
}

interface TypographyProps {
    fontSize: string;
    fontWeight: number | string;
}
