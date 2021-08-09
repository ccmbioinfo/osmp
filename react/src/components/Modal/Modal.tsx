import React, { Fragment } from 'react';
import {
    Button,
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
    footer?: string;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ title, footer, children, active, hideModal }) => {
    return (
        <Fragment>
            {active && (
                <ModalBlock>
                    <ModalOverlay onClick={() => hideModal()}></ModalOverlay>
                    <ModalContainer>
                        {title && (
                            <ModalHeader>
                                <ModalTitle>{title}</ModalTitle>
                                <ModalClose onClick={() => hideModal()}>X</ModalClose>
                            </ModalHeader>
                        )}
                        <ModalBody>{children}</ModalBody>
                        {footer && (
                            <ModalFooter>
                                <Button>{footer}</Button>
                            </ModalFooter>
                        )}
                    </ModalContainer>
                </ModalBlock>
            )}
        </Fragment>
    );
};
export default Modal;
