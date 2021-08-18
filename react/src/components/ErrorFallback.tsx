import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { Body, Button, Typography } from '../components';

const ErrorFallback: React.FC<FallbackProps> = ({ resetErrorBoundary }) => {
    return (
        <Body>
            <div role="alert">
                <Typography variant="h3" bold>
                    Something went wrong.
                </Typography>
                {resetErrorBoundary && (
                    <Button variant="primary" onClick={resetErrorBoundary}>
                        Go back
                    </Button>
                )}
            </div>
        </Body>
    );
};

export default ErrorFallback;
