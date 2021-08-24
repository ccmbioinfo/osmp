import React, { useMemo, useReducer } from 'react';
import { ServerError, ServerParseError } from '@apollo/client';
import { ExecutionResult, GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

type ErrorCategory = 'GRAPHQL' | 'NETWORK' | 'NODE';

interface Error {
    uid: string;
    code: string;
    message: string;
    data: [] | {}; // Actual response from the API
}

interface NodeError extends Error {
    source: 'local' | 'ensembl';
}

interface ErrorAction {
    type: `ADD_${ErrorCategory}_ERROR` | `REMOVE_${ErrorCategory}_ERROR`;
    payload: GraphQLError | Error | ServerParseError | ServerError | Response | string;
}

interface ErrorContextState {
    graphQLErrors: Error[];
    networkErrors: Error[];
    nodeErrors: NodeError[];
}

interface ErrorContextType {
    state: ErrorContextState;
    dispatch: React.Dispatch<ErrorAction>;
}

const initialState = {
    graphQLErrors: [] as Error[],
    networkErrors: [] as Error[],
    nodeErrors: [] as NodeError[],
};

const isGraphQLErrorDuplicate = (incoming: GraphQLError, state: ErrorContextState) => state.graphQLErrors.find(e => e.message === incoming.message && e.code === incoming.extensions?.code) !== undefined;

const errorReducer = (state = initialState, action: ErrorAction) => {
    switch (action.type) {
        case 'ADD_GRAPHQL_ERROR':
            const graphQlError = action.payload as GraphQLError;
            if (!isGraphQLErrorDuplicate(graphQlError, state)) {
                state.graphQLErrors.push({
                    uid: uuidv4(),
                    code: graphQlError.extensions?.code,
                    message: graphQlError.message,
                    data: graphQlError,
                });
            }
            return state;

        case 'REMOVE_GRAPHQL_ERROR':
            state.graphQLErrors = state.graphQLErrors.filter(e => e.uid !== action.payload);
            return state;

        case 'ADD_NETWORK_ERROR':
            const networkError = action.payload as ServerError | ServerParseError;
            state.networkErrors.push({
                uid: uuidv4(),
                code: 'statusCode' in networkError ? networkError.statusCode.toString() : '',
                message: networkError.message,
                data: networkError,
            });
            return state;

        case 'REMOVE_NETWORK_ERROR':
            state.networkErrors = state.networkErrors.filter(e => e.uid !== action.payload);
            return state;

        case 'ADD_NODE_ERROR':
            const nodeError = action.payload as GraphQLError;
            state.nodeErrors.push({
                uid: uuidv4(),
                code: nodeError.extensions?.code,
                message: nodeError.message,
                data: nodeError,
                source: 'local',
            });

            return state;

        case 'REMOVE_NODE_ERROR':
            state.nodeErrors = state.nodeErrors.filter(e => e.uid !== action.payload);
            return state;

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
export const clearError = (payload: string, type: ErrorCategory) => ({
    type: `CLEAR_${type}_ERROR`,
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
