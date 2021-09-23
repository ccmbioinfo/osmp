import React, { useState } from 'react';
import { FaClipboard, FaClipboardCheck } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import styled from 'styled-components';
import { Background, Flex, IconButton, Popover, Snackbar, Typography } from '../index';

interface ContactPopoverProps {
    state: any;
}

const Container = styled(props => <Background {...props} />)`
    margin: ${props => props.theme.space[4]};
    width: 300px;
`;

export const ContactPopover: React.FC<ContactPopoverProps> = ({ state }) => {
    const [copied, setCopied] = useState(false); // Whether text is copied
    const [openContact, setOpenContact] = useState(false);
    const [snackbarActive, setSnackbarActive] = useState(false);

    return (
        <Popover content="Contact" isOpen={openContact} onClick={() => setOpenContact(true)}>
            <Snackbar
                isActive={snackbarActive}
                variant="success"
                message={`${state.contactInfo} copied to clipboard.`}
                handleCloseSnackbar={() => setSnackbarActive(false)}
            />
            <Container variant="light">
                <Flex alignItems="center" justifyContent="space-between">
                    <Typography variant="p">{state.contactInfo}</Typography>
                    <IconButton
                        variant="light"
                        onClick={() => {
                            navigator.clipboard.writeText(state.contactInfo);
                            setCopied(true);
                            setSnackbarActive(true);
                        }}
                    >
                        {copied ? <FaClipboardCheck /> : <FaClipboard />}
                    </IconButton>
                    <IconButton
                        variant="light"
                        onClick={() => {
                            setCopied(false);
                            setOpenContact(false);
                            setSnackbarActive(false);
                        }}
                    >
                        <IoIosClose />
                    </IconButton>
                </Flex>
            </Container>
        </Popover>
    );
};
