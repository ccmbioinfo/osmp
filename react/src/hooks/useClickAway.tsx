import React, { useEffect } from 'react';

const useClickAway = <T extends HTMLElement, I extends HTMLElement>(
    containerRef: React.MutableRefObject<T>,
    onAwayClick: () => void,
    ignoreRef?: React.MutableRefObject<I>
) => {
    return useEffect(() => {
        const listener = (e: Event) => {
            if (
                containerRef.current &&
                !containerRef.current?.contains(e.target as Node) &&
                !ignoreRef?.current?.contains(e.target as Node)
            ) {
                onAwayClick();
            }
        };
        window.document.addEventListener('mousedown', listener);
        return () => window.document.removeEventListener('mousedown', listener);
    }, [containerRef, ignoreRef, onAwayClick]);
};

export default useClickAway;
