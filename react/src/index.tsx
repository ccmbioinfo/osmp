import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import ReactDOM from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { buildLink, client } from './apollo/client';
import keycloak from './keycloak';
import App from './pages/App';
import './index.css';

const errorHandler = (error: Error) => {
    console.log('error', error.message);
};

ReactDOM.render(
    <React.StrictMode>
        <ReactKeycloakProvider
            onTokens={tokens => client.setLink(buildLink(tokens.token))}
            authClient={keycloak}
        >
            <ErrorBoundary FallbackComponent={ErrorFallback} onError={errorHandler}>
                <App />
            </ErrorBoundary>
        </ReactKeycloakProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
