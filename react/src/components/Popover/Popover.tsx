import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLayer } from 'react-laag';
import styled from 'styled-components';
import { Button } from '../index';

interface Props {
    content: string;
    isOpen: boolean;
    onClick: () => void;
    onOutsideClick: () => void;
    children?: React.ReactNode;
}

const Container = styled(motion.div)`
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    position: fixed;
    right: 10px;
`;

const Popover: React.FC<Props> = ({ content, children, isOpen, onClick, onOutsideClick }) => {
    const { renderLayer, triggerProps, layerProps } = useLayer({
        isOpen,
        onOutsideClick: onOutsideClick,
    });

    return (
        <>
            <Button variant="primary" {...triggerProps} onClick={onClick}>
                {content}
            </Button>
            {renderLayer(
                <AnimatePresence>
                    {isOpen && (
                        <Container
                            {...layerProps}
                            initial={{ opacity: 0, scale: 0.85, x: 0, y: 20 }} // animate from
                            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} // animate to
                            exit={{ opacity: 0, scale: 0.85, x: 0, y: 20 }} // animate exit
                            transition={{
                                type: 'spring',
                                stiffness: 800,
                                damping: 35,
                            }}
                        >
                            {children}
                        </Container>
                    )}
                </AnimatePresence>
            )}
        </>
    );
};
export default Popover;
