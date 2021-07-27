import styled from 'styled-components';

export const Flex = styled.div`
    display: flex;
    margin: ${props => props.theme.space[3]};
`;

export const Column = styled(Flex)`
    flex-direction: column;
    margin-right: ${props => props.theme.space[3]};
    margin-bottom: 0px;
`;

export const Container = styled.div`
    margin: 0 auto;
    padding: 0 ${props => props.theme.space[6]};
    width: 100%;
`;
