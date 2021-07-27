import React from 'react';
import { Button } from '../index';
import {
    Menu,
    MenuItem,
    MenuItemBtn,
    MenuLink,
    MenuLinkBtn,
    Nav,
    NavbarContainer,
    NavLogo,
} from './Navbar.styles';

const Navbar: React.FC = () => {
    return (
        <div>
            <Nav>
                <NavbarContainer>
                    <NavLogo to="/">
                        {/* <NavIcon />  To-do: Add some logo here ...*/}
                        Single-Sided Matching Portal
                    </NavLogo>

                    <Menu>
                        <MenuItem>
                            <MenuLink to="/">Home</MenuLink>
                        </MenuItem>
                        <MenuItem>
                            <MenuLink to="/about">About</MenuLink>
                        </MenuItem>
                        <MenuItemBtn>
                            <MenuLinkBtn to="/logout">
                                <Button variant="primary">Log Out</Button>
                            </MenuLinkBtn>
                        </MenuItemBtn>
                    </Menu>
                </NavbarContainer>
            </Nav>
        </div>
    );
};

export default Navbar;
