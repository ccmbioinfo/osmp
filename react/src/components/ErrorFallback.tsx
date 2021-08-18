import React from 'react';
import { Button, Typography } from '../components';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div role="alert">
            <Typography variant="p" bold error>Something went wrong:</Typography>
            <Typography variant="subtitle">{error.message}</Typography>
            {resetErrorBoundary && <Button variant="primary" onClick={resetErrorBoundary}>Try again</Button>}
        </div>
    );
};

export default ErrorFallback;
