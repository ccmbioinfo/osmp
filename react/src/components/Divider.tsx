import styled from 'styled-components/macro';

const Divider = styled.div`
    background-color: lightgrey;
    height: 1px;
    margin: ${props => props.theme.space[5]} 0;
`;

export default Divider;
