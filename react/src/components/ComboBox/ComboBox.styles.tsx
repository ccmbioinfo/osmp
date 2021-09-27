import styled from 'styled-components';

const Flex = styled.div`
    display: flex;
`;

export const Input = styled.input`
    min-height: 45px;
    border: none;
    outline: none;
    font-size: ${props => props.theme.fontSizes.s};
    width: 70%;
`;
export const Wrapper = styled(Flex)`
    min-height: 38px;
    flex-wrap: wrap;
    flex-grow: 0;
    position: relative;
    width: 200px;
`;

export const Header = styled(Flex)`
    background-color: ${props => props.theme.background.main};
    border-color: ${props => props.theme.colors.muted};
    color: ${props => props.theme.colors.muted};
    border-radius: ${props => props.theme.radii.base};
    border: ${props => props.theme.borders.thin};
    box-shadow: ${props => props.theme.boxShadow};
    padding: ${props => props.theme.space[0]} ${props => props.theme.space[4]};
    justify-content: space-between;
    align-items: center;
    width: inherit;
`;
