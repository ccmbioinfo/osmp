import { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AboutPage, VariantQueryPage } from '.';
import { Flex, Navbar, Spinner } from '../components';
import theme from '../constants/theme';

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
        <ThemeProvider theme={theme}>
            <Flex justifyContent="center" alignItems="center">
                <Spinner />
            </Flex>
        </ThemeProvider>
    ) : authenticated ? (
        <ThemeProvider theme={theme}>
            <div>
                <Router>
                    <Navbar />
                    <Switch>
                        <Route path="/about">
                            <AboutPage />
                        </Route>
                        <Route path="/">
                            <VariantQueryPage />
                        </Route>
                    </Switch>
                </Router>
            </div>
        </ThemeProvider>
    ) : null;
};

export default App;
