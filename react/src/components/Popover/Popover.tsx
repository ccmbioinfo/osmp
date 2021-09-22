import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLayer } from 'react-laag';
import { Button } from '../index';

interface Props {
    content: string;
    children?: React.ReactNode;
}

const Popover: React.FC<Props> = ({ content, children }) => {
    const [isOpen, setOpen] = React.useState(false);

    const { renderLayer, triggerProps, layerProps } = useLayer({ isOpen });

    return (
        <>
            <Button variant="primary" {...triggerProps} onClick={() => setOpen(!isOpen)}>
                {content}
            </Button>
            {renderLayer(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
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
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    );
};
export default Popover;
