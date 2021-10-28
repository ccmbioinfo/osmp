import { useState } from 'react';
import { Maybe } from 'graphql/jsutils/Maybe';

export default function useSnackbar() {
    const [isActive, setIsActive] = useState<boolean>(false);
    const [message, setMessage] = useState<Maybe<string>>();

    const openSnackbar = (msg: Maybe<string> = 'Something went wrong...') => {
        setMessage(msg);
        setIsActive(true);
    };

    const closeSnackbar = () => {
        setIsActive(false);
    };

    return { isActive, message, openSnackbar, closeSnackbar };
}
