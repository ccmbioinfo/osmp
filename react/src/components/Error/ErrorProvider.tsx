import React, { useMemo, useReducer } from 'react';
import { ServerError, ServerParseError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse, VariantQueryResponseError } from '../../types';

interface FetchError {
    uid: string;
    code: string;
    message: Maybe<string>;
    source?: string;
}

/* TODO: narrow this down */
interface ErrorAction {
    type: string;
    payload:
        | Error
        | ErrorResponse
        | GraphQLError
        | FetchError
        | ServerError
        | ServerParseError
        | string;
}

interface ErrorContextState {
    graphQLErrors: FetchError[];
    networkErrors: FetchError[];
    nodeErrors: FetchError[];
}

interface ErrorContextType {
    state: ErrorContextState;
    dispatch: React.Dispatch<ErrorAction>;
}

const initialState: ErrorContextState = {
    graphQLErrors: [] as FetchError[],
    networkErrors: [] as FetchError[],
    nodeErrors: [] as FetchError[],
};

const isGraphQLErrorDuplicate = (incoming: GraphQLError, state: ErrorContextState) =>
    state.graphQLErrors.find(
        e => e.message === incoming.message && e.code === incoming.extensions?.code
    ) !== undefined;

const responseErrorTransformer = (error: GraphQLError): FetchError => ({
    uid: uuidv4(),
    code: error.extensions?.code,
    message: error.message,
});

const networkErrorTransformer = (
    error: ServerError | ServerParseError | Error | undefined
): FetchError => ({
    uid: uuidv4(),
    code: error && 'statusCode' in error ? error.statusCode.toString() : '500',
    message: error?.message,
});

const errorReducer = (state = initialState, action: ErrorAction) => {
    const { graphQLErrors, networkErrors, nodeErrors } = state;
    switch (action.type) {
        case 'ADD_GRAPHQL_ERROR':
            const graphQlError = action.payload as GraphQLError;
            if (!isGraphQLErrorDuplicate(graphQlError, state)) {
                state.graphQLErrors.push(responseErrorTransformer(graphQlError));
            }
            return state;

        case 'ADD_NETWORK_ERROR':
            const networkError = action.payload as
                | ServerError
                | ServerParseError
                | Error
                | undefined;
            state.networkErrors.push(networkErrorTransformer(networkError));
            return state;

        case 'ADD_NODE_ERROR':
            state.nodeErrors.push(action.payload as FetchError);
            return state;

        case 'REMOVE_ERROR':
            const errorUid = action.payload as string;
            return {
                graphQLErrors: graphQLErrors.filter(e => e.uid !== errorUid),
                nodeErrors: nodeErrors.filter(e => e.uid !== errorUid),
                networkErrors: networkErrors.filter(e => e.uid !== errorUid),
            };

        default:
            return state;
    }
};

export const ErrorContext = React.createContext<ErrorContextType>({
    state: initialState,
    dispatch: () => {},
});

export const makeGraphQLError = (payload: GraphQLError) => ({
    type: 'ADD_GRAPHQL_ERROR',
    payload,
});

export const makeNetworkError = (payload: ServerError | ServerParseError | Error | undefined) => ({
    type: 'ADD_NETWORK_ERROR',
    payload,
});

export const makeNodeError = (
    response: VariantQueryResponseError
): { type: string; payload: FetchError } => ({
    type: 'ADD_NODE_ERROR',
    payload: {
        uid: response.error?.id || uuidv4(),
        code: response.error?.code.toString() || '500',
        message: response.error?.message || '',
        source: response.source,
    },
});

// @param string is uuid of error
export const clearError = (payload: string) => ({
    type: 'REMOVE_ERROR',
    payload,
});

const ErrorProvider: React.FC<{}> = ({ children }) => {
    const [state, dispatch] = useReducer(errorReducer, initialState);

    const contextValue = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
};

export default ErrorProvider;
