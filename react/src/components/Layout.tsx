import styled from 'styled-components';

export const Flex = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: ${props => props.theme.space[3]} 0;
`;

export const Body = styled.div`
    padding: ${props => props.theme.space[4]};
`;

export const Column = styled(Flex)`
    flex-direction: column;
    margin-right: ${props => props.theme.space[3]};
    margin-bottom: 0px;
`;

export const ButtonWrapper = styled(Flex)`
    flex-direction: row;
    align-items: flex-end;
    margin: 0;
`;

export const Container = styled.div`
    margin: 0 auto;
    padding: 0 ${props => props.theme.space[6]};
    width: 100%;
`;
