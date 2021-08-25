import React from 'react';
import { Background, Button, Flex, Typography } from '../components';

interface ErrorIndicatorProps {
    message: string;
    handleCloseError: () => void;
}

const ErrorIndicator: React.FC<ErrorIndicatorProps> = ({ message, handleCloseError }) => {
    return (
        <Background variant="error">
            <Flex alignItems="center" justifyContent="space-between">
                <Typography variant="p" bold error>
                    {message}
                </Typography>
                <Button variant="secondary" onClick={handleCloseError}>
                    Dismiss
                </Button>
            </Flex>
        </Background>
    );
};

export default ErrorIndicator;
