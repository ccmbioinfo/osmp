import React, { useState } from 'react';
import { FaClipboard, FaClipboardCheck } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import styled from 'styled-components';
import { Background, Flex, IconButton, Popover, Snackbar, Typography } from '../index';

interface ContactPopoverProps {
    state: any;
}

const Container = styled(props => <Background {...props} />)`
    padding: ${props => props.theme.space[1]} ${props => props.theme.space[5]};
    width: 300px;
`;

export const ContactPopover: React.FC<ContactPopoverProps> = ({ state }) => {
    const [copied, setCopied] = useState(false); // Whether text is copied
    const [openContact, setOpenContact] = useState(false);
    const [snackbarActive, setSnackbarActive] = useState(false);

    const handleClosePopover = () => {
        setCopied(false);
        setOpenContact(false);
        setSnackbarActive(false);
    };

    return (
        <Popover
            content="Contact"
            isOpen={openContact}
            onClick={() => setOpenContact(true)}
            onOutsideClick={handleClosePopover}
        >
            <Snackbar
                isActive={snackbarActive}
                variant="success"
                message={`${state.contactInfo} copied to clipboard successfully.`}
                handleCloseSnackbar={handleClosePopover}
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
                    <IconButton variant="light" onClick={handleClosePopover}>
                        <IoIosClose />
                    </IconButton>
                </Flex>
            </Container>
        </Popover>
    );
};
