import React, { useState } from 'react';
import { FaClipboard, FaClipboardCheck } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import styled from 'styled-components';
import { Background, Column, Flex, IconButton, Popover, Snackbar, Typography } from '../index';
import { FlattenedQueryResponse } from './Table';

interface CellPopoverProps<T> {
    state: T;
    id: keyof T;
}

const Container = styled(props => <Background {...props} />)`
    padding: ${props => props.theme.space[1]} ${props => props.theme.space[5]};
    width: 300px;
`;

export const CellPopover: React.FC<CellPopoverProps<FlattenedQueryResponse>> = ({ state, id }) => {
    console.log(state);

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
            content={state[id]?.toString() || ''}
            isOpen={openContact}
            onClick={() => setOpenContact(true)}
            onOutsideClick={handleClosePopover}
        >
            <Column alignItems="center" justifyContent="center">
                <Snackbar
                    isActive={snackbarActive}
                    variant="success"
                    message={`${state[id]} copied to clipboard successfully.`}
                    handleCloseSnackbar={handleClosePopover}
                />
                <Container variant="light">
                    <Flex alignItems="center" justifyContent="space-between">
                        <Typography variant="p">{state[id]}</Typography>
                        <Flex>
                            <IconButton
                                variant="light"
                                onClick={() => {
                                    navigator.clipboard.writeText(state[id] as string);
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
                    </Flex>
                </Container>
            </Column>
        </Popover>
    );
};