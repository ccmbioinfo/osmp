import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { Button, Typography } from '../components';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div role="alert">
            <Typography variant="p" bold>
                Something went wrong.
            </Typography>
            <Typography variant="subtitle">{error.message}</Typography>
            {resetErrorBoundary && (
                <Button variant="primary" onClick={resetErrorBoundary}>
                    Try again
                </Button>
            )}
        </div>
    );
};

export default ErrorFallback;
