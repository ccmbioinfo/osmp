import styled, { keyframes } from 'styled-components';

const spin = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

export const Loader = styled.div`
    border: ${props => props.theme.borders.thin} rgba(0, 0, 0, 0.1);
    border-top: ${props => props.theme.borders.thin} #767676;
    border-radius: 50%;
    margin-inline-start: ${props => props.theme.space[3]};
    margin-top: 35px;
    width: ${props => props.theme.space[5]};
    height: ${props => props.theme.space[5]};
    animation: ${spin} 0.6s linear infinite;
`;

export default Loader;
