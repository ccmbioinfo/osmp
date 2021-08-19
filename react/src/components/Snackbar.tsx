import React, { useState } from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import styled, { keyframes } from 'styled-components';
import { Typography } from './index';

interface SnackbarVariant {
    variant: 'success' | 'error' | 'warning' | 'info';
    isActive: boolean;
}

interface SnackbarProps extends SnackbarVariant {
    message?: string;
    handleCloseSnackbar: () => void;
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

const Container = styled.div<SnackbarVariant>`
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

    animation: ${fadein} 0.5s, ${fadeout} 0.5s 3s;
`;

const Icons = Object.freeze({
    success: <FiCheckCircle />,
    error: <FiAlertCircle />,
    warning: <FiAlertTriangle />,
    info: <FiInfo />,
});

const Snackbar: React.FC<SnackbarProps> = ({ isActive, variant, message, handleCloseSnackbar }) => {
    console.log(isActive, message, variant);

    return isActive ? (
        <Container variant={variant} isActive={isActive}>
            {Icons[variant]}
            <Typography variant="subtitle" bold>
                {message}
            </Typography>
            <FiX onClick={handleCloseSnackbar} />
        </Container>
    ) : null;
};

export default Snackbar;
