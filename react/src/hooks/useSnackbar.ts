import { useEffect, useState } from 'react';

export default function useSnackbar() {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [message, setMessage] = useState<string>();

    useEffect(() => {
        if (isActive) {
            setTimeout(() => {
                setIsActive(false);
            }, 3000);
        }
    }, [isActive]);

    const openSnackBar = (msg = 'Something went wrong...') => {
        setMessage(msg);
        setIsActive(true);
    };

    const closeSnackbar = () => {
        setIsActive(false);
    };

    return { isActive, message, openSnackBar, closeSnackbar };
}
