import React, { useState } from 'react';
import { FaClipboard, FaClipboardCheck } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import styled from 'styled-components';
import { Background, Column, Flex, IconButton, Popover, Snackbar } from '../index';
import { FlattenedQueryResponse } from './Table';
import { CellText } from './Table.styles';

interface CellPopoverProps<T> {
    state: T;
    id: keyof T;
}

const Container = styled(props => <Background {...props} />)`
    padding: ${props => props.theme.space[1]} ${props => props.theme.space[5]};
    width: 300px;
`;

const FlexContainer = styled(props => <Flex {...props} />)`
    flex-wrap: nowrap;
`;

const PopoverText = styled(props => <CellText {...props} />)`
    font-size: small;
    padding: ${props => props.theme.space[2]} ${props => props.theme.space[3]}
        ${props => props.theme.space[2]} 0;
`;

export const CellPopover: React.FC<CellPopoverProps<FlattenedQueryResponse>> = ({ state, id }) => {
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
                    message={`${id} copied to clipboard successfully.`}
                    handleCloseSnackbar={handleClosePopover}
                />
                <Container variant="light">
                    <FlexContainer alignItems="center" justifyContent="space-between">
                        <PopoverText>{state[id]}</PopoverText>
                        <FlexContainer>
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
                        </FlexContainer>
                    </FlexContainer>
                </Container>
            </Column>
        </Popover>
    );
};
