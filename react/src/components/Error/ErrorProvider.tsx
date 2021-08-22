import React, { useMemo, useReducer } from 'react';

interface Error {
    uid: string;
    code: string;
    message: string;
    source?: string;
    data: [] | {}; // Actual response from the API
}

interface ErrorAction {
    type: 'ADD' | 'REMOVE';
    payload: Error;
}

interface ErrorContextType {
    state: {
        errors: Error[];
    };
    dispatch: React.Dispatch<ErrorAction>;
}

const initialState = {
    errors: [] as Error[],
};

export const ErrorContext = React.createContext<ErrorContextType>({
    state: initialState,
    dispatch: () => {},
});

// note: error formatting needed before passing in

const errorReducer = (state = initialState, action: ErrorAction) => {
    switch (action.type) {
        case 'ADD':
            return {
                errors: [...state.errors, action.payload],
            };
        case 'REMOVE':
            return {
                errors: state.errors.filter(error => error.uid !== action.payload.uid),
            };
        default:
            return state;
    }
};

const ErrorProvider: React.FC<{}> = ({ children }) => {
    const [state, dispatch] = useReducer(errorReducer, initialState);

    const contextValue = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
};

export default ErrorProvider;
