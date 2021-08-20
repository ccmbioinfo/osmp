import { useContext } from 'react';
import { ErrorContext } from '../components';

function useError() {
    const { state, dispatch } = useContext(ErrorContext);
    return { state, dispatch };
}

export default useError;