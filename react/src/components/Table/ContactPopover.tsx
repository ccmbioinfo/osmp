import React, { useState } from 'react';
import { FaClipboard, FaClipboardCheck } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import styled from 'styled-components';
import { Background, Flex, IconButton, Popover, Typography } from '../index';

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

    return (
        <Popover content="Contact" isOpen={openContact} onClick={() => setOpenContact(true)}>
            <Container variant="light">
                <Flex alignItems="center">
                    <Typography variant="p">{state.contactInfo}</Typography>
                    <IconButton
                        variant="light"
                        onClick={() => {
                            navigator.clipboard.writeText(state.contactInfo);
                            setCopied(true);
                        }}
                    >
                        {copied ? <FaClipboardCheck /> : <FaClipboard />}
                    </IconButton>
                    <IconButton
                        variant="light"
                        onClick={() => {
                            setCopied(false);
                            setOpenContact(false);
                        }}
                    >
                        <IoIosClose />
                    </IconButton>
                </Flex>
            </Container>
        </Popover>
    );
};
