import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Arrow, useHover, useLayer } from 'react-laag';
import { Typography } from './index';
import theme from '../constants/theme';

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

    const tooltipStyles = {
        backgroundColor: theme.colors.shadow,
        borderRadius: theme.radii.base,
        color: theme.background.main,
        padding: `0 ${theme.space[1]}`,
        width: 200,
    };

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
                            initial={{ opacity: 0, scale: 0.9, ...tooltipStyles }}
                            animate={{ opacity: 1, scale: 1, ...tooltipStyles }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.1 }}
                            {...layerProps}
                        >
                            <Typography variant="subtitle">{text}</Typography>
                            <Arrow
                                {...arrowProps}
                                backgroundColor={theme.colors.shadow}
                                borderColor={theme.colors.shadow}
                                borderWidth={1}
                                size={5}
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
