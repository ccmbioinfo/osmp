import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import ReactDOM from 'react-dom';
import { buildLink, client } from './apollo/client';
import keycloak from './keycloak';
import App from './pages/App';
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <ReactKeycloakProvider
            onTokens={tokens => client.setLink(buildLink(tokens.token))}
            authClient={keycloak}
        >
            <App />
        </ReactKeycloakProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
