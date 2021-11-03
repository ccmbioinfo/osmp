import React from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { Typography } from '../index';
import { Button, Container, SnackbarVariant } from './Snackbar.styles';

interface SnackbarProps extends SnackbarVariant {
    message: Maybe<string>;
    handleCloseSnackbar: () => void;
}

const Icons = Object.freeze({
    success: <FiCheckCircle />,
    error: <FiAlertCircle />,
    warning: <FiAlertTriangle />,
    info: <FiInfo />,
});

const Snackbar: React.FC<SnackbarProps> = ({ isActive, variant, message, handleCloseSnackbar }) => {
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
