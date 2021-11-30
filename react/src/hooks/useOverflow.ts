import { RefObject, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';

import useWindowSize from './useWindowSize';

function useOverflow(ref: RefObject<HTMLElement>): {
    isScrolling: boolean;
    refXOverflowing: boolean;
    refYOverflowing: boolean;
    refXScrollBegin: boolean;
    refXScrollEnd: boolean;
    refYScrollBegin: boolean;
    refYScrollEnd: boolean;
} {
    const [refXOverflowing, setRefXOverflowing] = useState(false);
    const [refYOverflowing, setRefYOverflowing] = useState(false);

    const [refXScrollBegin, setRefXScrollBegin] = useState(true);
    const [refXScrollEnd, setRefXScrollEnd] = useState(false);

    const [refYScrollBegin, setRefYScrollBegin] = useState(true);
    const [refYScrollEnd, setRefYScrollEnd] = useState(false);

    const [isScrolling, setIsScrolling] = useState(false);

    const size = useWindowSize();

    const handleEndScroll = useMemo(
        () =>
            _.debounce(() => {
                setIsScrolling(false);
            }, 100),
        []
    );

    useEffect((): any => {
        if (!ref?.current) {
            return;
        }

        let observerRef = ref.current;

        const isXOverflowing = ref.current.scrollWidth > ref.current.clientWidth;
        const isYOverflowing = ref.current.scrollHeight > ref.current.clientHeight;

        if (refXOverflowing !== isXOverflowing) {
            setRefXOverflowing(isXOverflowing);
        }

        if (refYOverflowing !== isYOverflowing) {
            setRefYOverflowing(isYOverflowing);
        }

        const handleScroll = (): void => {
            setIsScrolling(true);

            // Handle X Overflow
            const offsetRight = ref?.current?.scrollWidth! - ref?.current?.clientWidth!;
            if (ref?.current?.scrollLeft! >= offsetRight && refXScrollEnd === false) {
                setRefXScrollEnd(true);
            } else {
                setRefXScrollEnd(false);
            }

            if (ref?.current?.scrollLeft === 0) {
                setRefXScrollBegin(true);
            } else {
                setRefXScrollBegin(false);
            }

            // Handle Y Overflow
            const offsetBottom = ref?.current?.scrollHeight! - ref?.current?.clientHeight!;
            if (ref?.current?.scrollTop! >= offsetBottom && refYScrollEnd === false) {
                setRefYScrollEnd(true);
            } else {
                setRefYScrollEnd(false);
            }

            if (ref?.current?.scrollTop === 0) {
                setRefYScrollBegin(true);
            } else {
                setRefYScrollBegin(false);
            }

            handleEndScroll();
        };

        observerRef.addEventListener('scroll', handleScroll);

        return (): void => {
            observerRef?.removeEventListener('scroll', handleScroll);
        };
    }, [
        ref,
        refXOverflowing,
        refYOverflowing,
        refXScrollEnd,
        refYScrollEnd,
        size.width,
        handleEndScroll,
    ]); // Empty array ensures that effect is only run on mount and unmount

    return {
        isScrolling,
        refXOverflowing,
        refYOverflowing,
        refXScrollBegin,
        refXScrollEnd,
        refYScrollBegin,
        refYScrollEnd,
    };
}

export default useOverflow;
