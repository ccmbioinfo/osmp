import React from 'react';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import ReactDOM from 'react-dom';
import { buildLink, client } from './apollo/client';
import keycloak from './keycloak';
import App from './pages/App';
import './index.css';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
    error: Error
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
    return (
        <div role="alert">
          <p>Something went wrong:</p>
          <pre>{error.message}</pre>
        </div>
      )
}

const errorHandler = (error: Error) => {
    console.log('error', error.message)
}

ReactDOM.render(
    <React.StrictMode>
        <ReactKeycloakProvider
            onTokens={tokens => client.setLink(buildLink(tokens.token))}
            authClient={keycloak}
        >
            <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onError={errorHandler}
            >
                {/* <App/> */}
                <button onClick={() => { throw new Error('random') }}>BUTTON</button>
            </ErrorBoundary>

            <ErrorBoundary
                fallbackRender={({error, resetErrorBoundary}) => (
                <div role="alert">
                    <div>Oh no</div>
                    <pre>{error.message}</pre>
                    <button
                    onClick={() => {
                        
                        // though you could accomplish this with a combination
                        // of the FallbackCallback and onReset props as well.
                        resetErrorBoundary()
                    }}
                    >
                    Try again
                    </button>
                </div>
                )}
            >
                <button onClick={() => { throw new Error('random') }}>BUTTON 2</button>
            </ErrorBoundary>

            <ErrorBoundary fallback={<div>Oh no</div>}>
                <button onClick={() => { throw new Error('random') }}>BUTTON 3</button>
            </ErrorBoundary>
        </ReactKeycloakProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
