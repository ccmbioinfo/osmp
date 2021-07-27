import { Meta, Story } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import Typography from '../components/Typography';
import theme from '../constants/theme';

export default {
    title: 'TypographySanityCheck',
    component: Typography,
    argTypes: {
        variant: {
            options: ['h3', 'p'],
            control: { type: 'radio' },
        },
    },
} as Meta;

const Template: Story<{ bold: boolean; variant: 'h3' | 'p' }> = args => (
    <ThemeProvider theme={theme}>
        <Typography {...args}>Hello World!</Typography>
    </ThemeProvider>
);

export const Primary = Template.bind({});

Primary.args = {
    bold: false,
    variant: 'p',
};
