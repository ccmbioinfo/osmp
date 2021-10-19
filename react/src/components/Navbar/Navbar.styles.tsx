import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Container, Flex } from '../index';

export const Nav = styled(Flex)`
    font-family: ${props => props.theme.fontFamily.heading};
    font-size: ${props => props.theme.fontSizes.m};
    position: sticky;
    top: 0;
    z-index: 999;
    height: 80px;
    background-color: #1b0c38;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.15);
    justify-content: center;
    align-items: center;
    ${Flex}
`;

export const NavbarContainer = styled(Container)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    ${Container};
`;

export const NavLogo = styled(Link)`
    color: ${props => props.theme.colors.background};
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

export const Menu = styled(Flex)`
    align-items: center;
    text-align: center;
    ${Flex}
`;

export const MenuItem = styled.li`
    list-style: none;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const MenuLink = styled(Link)`
    text-decoration: none;
    font-weight: bold;
    font-size: ${props => props.theme.fontSizes.m};
    font-family: ${props => props.theme.fontFamily.heading};
    color: ${props => props.theme.colors.background};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${props => props.theme.space[0]} ${props => props.theme.space[5]};
    height: 100%;
    transition: all 0.2s ease;
    &:hover {
        transform: scale(1.08);
    }
    &:active {
        transform: traslateY(3rem);
        color: #e38b06;
    }
`;

export const MenuItemBtn = styled.li`
    list-style: none;
`;

export const MenuLinkBtn = styled(Link)`
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 16px;
    height: 100%;
    width: 100%;
    border: none;
    outline: none;
`;
