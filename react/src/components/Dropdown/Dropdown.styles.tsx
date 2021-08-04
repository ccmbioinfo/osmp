import styled from 'styled-components';

const Flex = styled.div`
    display: flex;
`;

export const Input = styled.input`
    min-height: 45px;
    border: none;
    outline: none;
    font-size: ${props => props.theme.fontSizes.s};
`;
export const Wrapper = styled(Flex)`
    min-height: 38px;
    flex-wrap: wrap;
    flex-grow: 0;
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
    cursor: pointer;
    width: 100%;
`;

export const Title = styled.p`
    font-family: ${props => props.theme.fontFamily.body};
    font-size: ${props => props.theme.fontSizes.s};
    color: ${props => props.theme.colors.text};
    margin-inline-end: ${props => props.theme.space[1]};
`;

export const List = styled.div`
    box-shadow: ${props => props.theme.boxShadow}
    padding: 0;
    margin: 0;
    width: inherit;
    margin-top: ${props => props.theme.space[4]};
    max-height: 100px;
    overflow: auto;
    position: absolute;
    top: 200px;
    z-index: 1;
    /* Dropdown List Styling */
    > li {
        list-style-type: none;
        &:first-of-type {
            > button {
                border-top: ${props => props.theme.borders.thin} ${props =>
    props.theme.colors.muted};
                border-top-left-radius: ${props => props.theme.radii.base};
                border-top-right-radius: ${props => props.theme.radii.base};
            }
        }
        &:last-of-type > button {
          border-bottom-left-radius: ${props => props.theme.radii.base};
          border-bottom-right-radius: ${props => props.theme.radii.base};
        }
        button {
            display: flex;
            justify-content: space-between;
            background-color: ${props => props.theme.colors.background};
            font-size: ${props => props.theme.fontSizes.s};
            padding: 15px 20px 15px 20px;
            border: 0;
            border-bottom: ${props => props.theme.borders.thin} ${props =>
    props.theme.colors.muted};
            width: 100%;
            text-align: left;
            border-left: ${props => props.theme.borders.thin} ${props => props.theme.colors.muted};
            border-right: ${props => props.theme.borders.thin} ${props => props.theme.colors.muted};
            &:hover {
                cursor: pointer;
                font-weight: bold;
                color: ${props => props.theme.colors.success};
                background-color: ${props => props.theme.background.success};
            }
        }
    }
`;
