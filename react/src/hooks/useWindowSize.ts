import { useEffect, useState } from 'react';

function useWindowSize(): { height: number | undefined; width: number | undefined } {
    const isClient = typeof window === 'object';

    function getSize(): { height: number | undefined; width: number | undefined } {
        return {
            width: isClient ? window.innerWidth : undefined,
            height: isClient ? window.innerHeight : undefined,
        };
    }

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect((): any => {
        if (!isClient) {
            return false;
        }

        function handleResize(): void {
            setWindowSize(getSize());
        }

        window.addEventListener('resize', handleResize);

        return (): void => window.removeEventListener('resize', handleResize);
    });

    return windowSize;
}

export default useWindowSize;
