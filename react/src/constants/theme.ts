import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
    background: {
        main: '#fff',
        success: '#effbef',
        light: '#f8f8ff',
    },
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    colors: {
        text: '#333',
        background: '#fff',
        primary: '#5c4cdf',
        secondary: '#767676',
        accent: '#351f65',
        muted: '#efefef',
        error: '#d0453e',
        success: '#4caf50',
        info: '#2196f3',
        warning: '#ff9800',
    },
    space: [
        '0rem',
        '0.125rem', // 2px
        '0.25rem', // 4px
        '0.5rem', // 8px
        '1rem', // 16px
        '2rem', // 32px
        '4rem', // 64px
        '8rem', // 128px
        '16rem', // 256px
    ],
    fontFamily: {
        heading: 'DM Sans',
        body: 'Roboto',
    },
    fontSizes: {
        xl: '2rem',
        l: '1.5rem',
        m: '1rem',
        s: '0.9rem',
        xs: '0.75rem',
    },
    fontWeights: {
        light: 200,
        normal: 400,
        bold: 700,
    },
    lineHeights: {
        body: 1.5,
        heading: 1.1,
    },
    borders: {
        none: 'none',
        thin: '1px solid',
    },
    radii: {
        none: 0,
        base: '0.25em', // 4px
        round: '99999em', // A circle
    },
    typography: {
        h3: {
            fontSize: '24px',
            fontWeight: 600,
        },
        h4: {
            fontSize: '24px',
            fontWeight: 600,
        },
        p: {
            fontSize: '12px',
            fontWeight: 'normal',
        },
        subtitle: {
            fontSize: '12px',
            fontWeight: 'normal',
        },
    },
};

export default theme;
