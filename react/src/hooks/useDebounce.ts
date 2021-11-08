import { useEffect, useState } from 'react';

function useDebounce<T>(initialValue: T, time: number): [T, T, React.Dispatch<T>] {
    const [value, setValue] = useState<T>(initialValue);
    const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

    useEffect(() => {
        const debounce = setTimeout(() => {
            setDebouncedValue(value);
        }, time);
        return () => {
            clearTimeout(debounce);
        };
    }, [value, time]);

    return [debouncedValue, value, setValue];
}

export default useDebounce;
