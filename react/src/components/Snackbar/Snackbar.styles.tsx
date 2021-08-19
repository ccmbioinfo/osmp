import styled, { keyframes } from 'styled-components';

export interface SnackbarVariant {
    variant: 'success' | 'error' | 'warning' | 'info';
    isActive: boolean;
}

const fadein = keyframes`
    from {
      bottom: 0;
      opacity: 0;
    }
    to {
      bottom: 1rem;
      opacity: 1;
    }
`;

const fadeout = keyframes`
    from {
      bottom: 1rem;
      opacity: 1;
    }
    to {
      bottom: 0;
      opacity: 0;
    }
`;

export const Container = styled.div<SnackbarVariant>`
    position: fixed;
    z-index: 1000;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    height: auto;

    display: flex;
    align-items: center;

    gap: ${props => props.theme.space[4]};
    padding: 0 ${props => props.theme.space[4]};
    border-radius: ${props => props.theme.radii.base};
    box-shadow: ${props => props.theme.boxShadow};
    color: ${props => props.theme.colors.background};
    background-color: ${props => props.theme.colors[props.variant]};

    animation: ${fadein} 0.5s, ${fadeout} 0.5s 2.5s;
`;
// Note: TIME = (timeout - 500) / 1000 + "s";

export const Button = styled.button`
    background: transparent;
    display: flex;
    align-items: center;
    border: none;
    color: white;
    cursor: pointer;
`;
