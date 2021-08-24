import React, { useMemo, useReducer } from 'react';
import { ServerError, ServerParseError } from '@apollo/client';
import { ExecutionResult, GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

interface Error {
    uid: string;
    code: string;
    message: string;
    data: [] | {}; // Actual response from the API
}

interface ErrorAction {
    type: string;
    payload: GraphQLError | Error | ServerParseError | ServerError | Response | string;
}

interface ErrorContextState {
    graphQLErrors: Error[];
    networkErrors: Error[];
    nodeErrors: Error[];
}

interface ErrorContextType {
    state: ErrorContextState;
    dispatch: React.Dispatch<ErrorAction>;
}

const initialState = {
    graphQLErrors: [] as Error[],
    networkErrors: [] as Error[],
    nodeErrors: [] as Error[],
};

const isGraphQLErrorDuplicate = (incoming: GraphQLError, state: ErrorContextState) =>
    state.graphQLErrors.find(
        e => e.message === incoming.message && e.code === incoming.extensions?.code
    ) !== undefined;

const responseErrorTransformer = (error: GraphQLError) => ({
    uid: uuidv4(),
    code: error.extensions?.code,
    message: error.message,
    data: error,
});

const networkErrorTransformer = (error: ServerError | ServerParseError) => ({
    uid: uuidv4(),
    code: 'statusCode' in error ? error.statusCode.toString() : '',
    message: error.message,
    data: error,
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

        case 'REMOVE_GRAPHQL_ERROR':
            return {
                graphQLErrors: graphQLErrors.filter(e => e.uid !== action.payload),
                networkErrors,
                nodeErrors,
            };

        case 'ADD_NETWORK_ERROR':
            const networkError = action.payload as ServerError | ServerParseError;
            state.networkErrors.push(networkErrorTransformer(networkError));
            return state;

        case 'REMOVE_NETWORK_ERROR':
            return {
                graphQLErrors,
                networkErrors: networkErrors.filter(e => e.uid !== action.payload),
                nodeErrors,
            };

        case 'ADD_NODE_ERROR':
            const nodeError = action.payload as GraphQLError;
            state.nodeErrors.push(responseErrorTransformer(nodeError));
            return state;

        case 'REMOVE_NODE_ERROR':
            return {
                graphQLErrors,
                networkErrors,
                nodeErrors: nodeErrors.filter(e => e.uid !== action.payload),
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

export const makeNetworkError = (payload: ServerError | ServerParseError) => ({
    type: 'ADD_NETWORK_ERROR',
    payload,
});

export const makeNodeError = (payload: ExecutionResult) => ({
    type: 'ADD_NODE_ERROR',
    payload,
});

// @param string is uuid of error
export const clearNetworkError = (payload: string) => ({
    type: 'REMOVE_NETWORK_ERROR',
    payload,
});

export const clearNodeError = (payload: string) => ({
    type: 'REMOVE_NODE_ERROR',
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
