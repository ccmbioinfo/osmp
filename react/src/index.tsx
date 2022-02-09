import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from 'styled-components/macro';
import { ErrorFallback } from '../src/components';
import theme from '../src/constants/theme';
import { buildLink, client } from './apollo/client';
import keycloak from './keycloak';
import App from './pages/App';
import './index.css';

const errorHandler = (error: Error) => console.error(error);

ReactDOM.render(
    <React.StrictMode>
        <ReactKeycloakProvider
            onTokens={tokens => client.setLink(buildLink(tokens.token))}
            authClient={keycloak}
        >
            <ThemeProvider theme={theme}>
                <ErrorBoundary
                    FallbackComponent={({ error, resetErrorBoundary }) => (
                        <ErrorFallback
                            error={error}
                            variant="severe"
                            resetErrorBoundary={resetErrorBoundary}
                        />
                    )}
                    onError={errorHandler}
                >
                    <App />
                </ErrorBoundary>
            </ThemeProvider>
        </ReactKeycloakProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
