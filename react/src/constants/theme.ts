import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
    palette: {
        primary: 'green',
        typography: {
            main: 'black',
            error: 'red',
        },
    },

    typography: {
        h3: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '24px',
            fontWeight: 600,
        },
        h4: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '24px',
            fontWeight: 600,
        },
        p: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            fontWeight: 'normal',
        },
    },
};

export default theme;
