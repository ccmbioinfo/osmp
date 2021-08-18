import React from 'react';
import styled from 'styled-components';
import { FallbackProps } from 'react-error-boundary';
import error from '../assets/error.svg';
import { Body, Button, Typography } from '../components';

interface CustomErrorFallbackProps extends FallbackProps {
    /**
     * @variation severe should be used only when the whole app throws an error and <App /> can't be displayed.
     */
    variant: 'normal' | 'severe';
}

const Background = styled.div`
    background-image: url(${error});
    height: 100vh;
    width: 100vw;
    position: relative;
    display: flex;
    align-items: center;
    display-content: center;
    padding: 0 60px;
`;
const NavLogo = styled.div`
    position: absolute;
    top: 30px;
    left: 60px;
    color: ${props => props.theme.colors.primary};
    cursor: pointer;
    display: flex;
    align-items: center;
    text-decoration: none;
    font-size: ${props => props.theme.fontSizes.m};
    font-family: ${props => props.theme.fontFamily.heading};
    font-weight: ${props => props.theme.fontWeights.bold};
    transition: all 0.5s ease;
    &:hover {
        transform: scale(1.08);
    }
`;

const ErrorFallback: React.FC<CustomErrorFallbackProps> = ({ variant, resetErrorBoundary }) => {
    switch (variant) {
        case 'normal':
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
        case 'severe':
            return (
                <>
                    <div>
                        <NavLogo>SSMP</NavLogo>
                    </div>
                    <Background>
                        <div role="alert">
                            <Typography variant="h3" bold>
                                Oops! Something went wrong.
                            </Typography>
                            <Typography variant="p">Please try again.</Typography>
                            {resetErrorBoundary && (
                                <Button variant="primary" onClick={resetErrorBoundary}>
                                    Go back
                                </Button>
                            )}
                        </div>
                    </Background>
                </>
            );
    }
};

export default ErrorFallback;
