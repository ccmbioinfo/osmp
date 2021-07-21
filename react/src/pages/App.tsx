import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { VariantQueryPage } from '.';
import theme from '../constants/theme';

const App: React.FC<{}> = () => {
    return (
        <ThemeProvider theme={theme}>
            <div>
                <header>
                    <h2>Hello World</h2>
                </header>
                <Router>
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
