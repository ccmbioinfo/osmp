import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useUserInfo } from '../../hooks';
import { Avatar, Button } from '../index';
import {
    Menu,
    MenuItem,
    MenuItemBtn,
    MenuLink,
    Nav,
    NavbarContainer,
    NavLogo,
} from './Navbar.styles';

const Navbar: React.FC = () => {
    const userInfo = useUserInfo<any>();

    const {
        keycloak: { logout },
    } = useKeycloak();

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
                            <Button variant="primary" onClick={() => logout()}>
                                Log Out
                            </Button>
                        </MenuItemBtn>
                        <MenuItem>
                            {userInfo && <Avatar username={userInfo.preferred_username} />}
                        </MenuItem>
                    </Menu>
                </NavbarContainer>
            </Nav>
        </div>
    );
};

export default Navbar;
