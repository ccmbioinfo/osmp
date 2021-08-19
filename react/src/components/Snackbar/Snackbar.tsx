import React from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { Typography } from '../index';
import { Button, Container, SnackbarVariant } from './Snackbar.styles';

interface SnackbarProps extends SnackbarVariant {
    message?: string;
    handleCloseSnackbar: () => void;
}

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
            <Button onClick={handleCloseSnackbar}>
                <FiX />
            </Button>
        </Container>
    ) : null;
};

export default Snackbar;
