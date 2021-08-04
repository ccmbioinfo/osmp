import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { VariantQueryPage } from '.';
import { Navbar } from '../components';
import theme from '../constants/theme';

const App: React.FC<{}> = () => {
    return (
        <ThemeProvider theme={theme}>
            <div>
                <Router>
                    <Navbar />
                    <Switch>
                        <Route path="*">
                            <VariantQueryPage />
                        </Route>
                    </Switch>
                </Router>
            </div>
        </ThemeProvider>
    );
};

export default App;
