import { useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { useErrorContext } from '../hooks';
import { VariantQueryResponse } from '../types';

const useErrorHandler = (
    data: { getVariants: VariantQueryResponse } | undefined,
    error: ApolloError | undefined
) => {
    const { dispatch } = useErrorContext();

    const response = { error };
    const getVariantsErrors = data?.getVariants.errors;
    const networkErrors = response.error?.networkError;
    const graphQLErrors = response.error?.graphQLErrors;

    useEffect(() => {
        if (getVariantsErrors && !!getVariantsErrors.length) {
            getVariantsErrors.forEach(e => {
                dispatch({
                    type: 'ADD',
                    payload: {
                        uid: uuidv4(),
                        code: e.error.code.toString(),
                        message: e.error.message,
                        source: e.source,
                        data: e,
                    },
                });
            });
        }

        if (graphQLErrors) {
            graphQLErrors.forEach(e => {
                dispatch({
                    type: 'ADD',
                    payload: {
                        uid: uuidv4(),
                        code: e.extensions?.code,
                        message: e.message,
                        data: e,
                    },
                });
            });
        }

        if (networkErrors) {
            dispatch({
                type: 'ADD',
                payload: {
                    uid: uuidv4(),
                    code: 'statusCode' in networkErrors ? networkErrors.statusCode.toString() : '',
                    message: networkErrors.message,
                    data: networkErrors,
                },
            });
        }
    }, [error, data, dispatch, getVariantsErrors, networkErrors, graphQLErrors]);
};

export default useErrorHandler;
