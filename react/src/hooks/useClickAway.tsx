import React, { useEffect } from 'react';

const useClickAway = <T extends HTMLElement, I extends HTMLElement>(
    containerRef: React.MutableRefObject<T>,
    onAwayClick: () => void,
    ignoreRef?: React.MutableRefObject<I>
) => {
    return useEffect(() => {
        const listener = (e: Event) => {
            if (
                !containerRef.current?.contains(e.target as Node) &&
                !ignoreRef?.current?.contains(e.target as Node)
            ) {
                onAwayClick();
            }
        };
        window.document.addEventListener('click', listener);
        return () => window.document.removeEventListener('onclick', listener);
    }, [ignoreRef, containerRef, onAwayClick]);
};

export default useClickAway;
