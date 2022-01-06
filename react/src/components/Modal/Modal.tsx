import React, { Fragment } from 'react';
import { BsX } from 'react-icons/bs';
import { Button } from '../index';
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
}

const Modal: React.FC<ModalProps> = ({ title, footer, children, active, hideModal, onClick }) => {
    return (
        <Fragment>
            {active && (
                <ModalBlock>
                    <ModalOverlay onClick={() => hideModal()}></ModalOverlay>
                    <ModalContainer>
                        {title && (
                            <ModalHeader>
                                <ModalTitle>{title}</ModalTitle>
                                <ModalClose onClick={() => hideModal()}>
                                    <BsX />
                                </ModalClose>
                            </ModalHeader>
                        )}
                        <ModalBody>{children}</ModalBody>
                        {footer && (
                            <ModalFooter>
                                <Button
                                variant="primary"
                                onClick={onClick}>{footer}</Button>
                            </ModalFooter>
                        )}
                    </ModalContainer>
                </ModalBlock>
            )}
        </Fragment>
    );
};
export default Modal;
