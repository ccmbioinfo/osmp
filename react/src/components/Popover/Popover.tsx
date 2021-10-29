import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLayer } from 'react-laag';
import styled from 'styled-components';
import { CellText } from '../index';

interface Props {
    content: string;
    isOpen: boolean;
    onClick: () => void;
    onOutsideClick: () => void;
    children?: React.ReactNode;
}

const Wrapper = styled.div`
    position: relative;
`;

const Container = styled(motion.div)`
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    position: absolute;
`;

//Todo: need to make a wrapper around Container so it can attach to the right position

const Popover: React.FC<Props> = ({ content, children, isOpen, onClick, onOutsideClick }) => {
    const { renderLayer, triggerProps, layerProps } = useLayer({
        isOpen,
        onOutsideClick: onOutsideClick,
        auto: true,
    });

    return (
        <>
            <CellText {...triggerProps} onClick={onClick}>
                {content}
            </CellText>
            {renderLayer(
                <AnimatePresence>
                    <Wrapper>
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
                    </Wrapper>
                </AnimatePresence>
            )}
        </>
    );
};
export default Popover;
