import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { VariantQueryPage } from '.';
import { Typography } from '../components';
import theme from '../constants/theme';

const App: React.FC<{}> = () => {
    return (
        <ThemeProvider theme={theme}>
            <div>
                <header>
                    <Typography variant="h3">This is the main page heading</Typography>
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
