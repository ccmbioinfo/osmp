import { useContext } from 'react';
import { ErrorContext } from '../components';

function useErrorContext() {
    const { state, dispatch } = useContext(ErrorContext);
    return { state, dispatch };
}

export default useErrorContext;
