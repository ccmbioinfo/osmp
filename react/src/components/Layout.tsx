import styled from 'styled-components';

export const Flex = styled.div`
    display: flex;
`;

export const Column = styled(Flex)`
    flex-direction: column;
    margin-right: ${props => props.theme.space[3]};
    margin-bottom: 0px;
`;
