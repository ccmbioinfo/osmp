import { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { AboutPage, VariantQueryPage } from '.';
import { ErrorFallback, Flex, Navbar, Spinner } from '../components';

const App: React.FC<{}> = () => {
    const {
        keycloak: { authenticated, login },
        initialized,
    } = useKeycloak();

    useEffect(() => {
        if (initialized && !authenticated) {
            login();
        }
    }, [initialized, authenticated, login]);

    return !initialized ? (
        <Flex justifyContent="center" alignItems="center">
            <Spinner />
        </Flex>
    ) : authenticated ? (
        <div>
            <Router>
                <Navbar />
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Switch>
                        <Route path="/about">
                            <AboutPage />
                        </Route>
                        <Route path="/">
                            <VariantQueryPage />
                        </Route>
                    </Switch>
                </ErrorBoundary>
            </Router>
        </div>
    ) : null;
};

export default App;
