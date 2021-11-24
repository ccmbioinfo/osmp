import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Arrow, useHover, useLayer } from 'react-laag';

interface TooltipProps {
    text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    const [isOver, hoverProps] = useHover({ delayEnter: 100, delayLeave: 300 });

    const { triggerProps, layerProps, arrowProps, renderLayer } = useLayer({
        isOpen: isOver,
        placement: 'top-center',
        triggerOffset: 8,
    });

    let trigger;
    if (isReactText(children)) {
        trigger = (
            <span className="tooltip-text-wrapper" {...triggerProps} {...hoverProps}>
                {children}
            </span>
        );
    } else {
        // In case of an react-element, we need to clone it in order to attach our own props
        if (React.isValidElement(children)) {
            trigger = React.cloneElement(children, {
                ...triggerProps,
                ...hoverProps,
            });
        }
    }

    return (
        <>
            {trigger}
            {renderLayer(
                <AnimatePresence>
                    {isOver && (
                        <motion.div
                            className="tooltip-box"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.1 }}
                            {...layerProps}
                        >
                            {text}
                            <Arrow
                                {...arrowProps}
                                backgroundColor="black"
                                borderColor="black"
                                borderWidth={1}
                                size={6}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    );
};

function isReactText(children: any) {
    return ['string', 'number'].includes(typeof children);
}

export default Tooltip;
