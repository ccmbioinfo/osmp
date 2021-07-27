import styled from 'styled-components';

const Flex = styled.div`
  display: flex;
`

export const Wrapper = styled(Flex)`
    min-height: 38px;
    flex-wrap: wrap;
`;

export const Header = styled(Flex)`
    background-color: ${props => props.theme.background};
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
    font-size: ${props => props.theme.fontSizes.s};
    color: ${props => props.theme.colors.text};
    margin-inline-end: ${props => props.theme.space[1]};
`;

export const List = styled.div`
    box-shadow: ${props => props.theme.boxShadow}
    padding: 0;
    margin: 0;
    width: 100%;
    margin-top: 20px;
    max-height: 100px;
    overflow: auto;

    /* Dropdown List Styling */

    > li {
        list-style-type: none;

        &:first-of-type {
            > button {
                border-top: ${props => props.theme.borders.thin} ${props => props.theme.colors.muted};
                border-top-left-radius: ${props => props.theme.radii.base};
                border-top-right-radius: ${props => props.theme.radii.base};
            }
        }

        &:last-of-type > button {
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        button {
            display: flex;
            justify-content: space-between;
            background-color: white;
            font-size: 14px;
            padding: 15px 20px 15px 20px;
            border: 0;
            border-bottom: 1px solid #ccc;
            width: 100%;
            text-align: left;
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;

            &:hover {
                cursor: pointer;
                font-weight: bold;
                color: #78d380;
                background-color: #effbef;
            }
        }
    }
`;
