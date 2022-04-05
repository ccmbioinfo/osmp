import React, { Fragment } from 'react';
import { BsX } from 'react-icons/bs';
import { RiInformationFill } from 'react-icons/ri';
import { Button, Tooltip } from '../index';
import { InlineFlex } from '../Layout';
import { IconPadder } from '../Table/Table.styles';
import {
    ModalBlock,
    ModalBody,
    ModalClose,
    ModalContainer,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    ModalTitle,
} from './Modal.styles';

interface ModalProps {
    hideModal: () => void;
    active: Boolean;
    onClick?: () => void;
    footer?: string;
    title?: string;
    helperText?: string;
}

const Modal: React.FC<ModalProps> = ({
    title,
    footer,
    children,
    active,
    hideModal,
    onClick,
    helperText,
}) => {
    return (
        <Fragment>
            {active && (
                <ModalBlock>
                    <ModalOverlay onClick={() => hideModal()}></ModalOverlay>
                    <ModalContainer>
                        {title && (
                            <ModalHeader>
                                <InlineFlex>
                                    <ModalTitle>{title}</ModalTitle>
                                    {helperText && (
                                        <Tooltip helperText={helperText}>
                                            <IconPadder>
                                                <RiInformationFill color="lightgrey" />
                                            </IconPadder>
                                        </Tooltip>
                                    )}
                                </InlineFlex>
                                <ModalClose onClick={() => hideModal()}>
                                    <BsX />
                                </ModalClose>
                            </ModalHeader>
                        )}
                        <ModalBody>{children}</ModalBody>
                        {footer && (
                            <ModalFooter>
                                <Button variant="primary" onClick={onClick}>
                                    {footer}
                                </Button>
                            </ModalFooter>
                        )}
                    </ModalContainer>
                </ModalBlock>
            )}
        </Fragment>
    );
};
export default Modal;
