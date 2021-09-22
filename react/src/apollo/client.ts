import {
    ApolloClient,
    createHttpLink,
    from,
    InMemoryCache,
    Observable,
    useLazyQuery,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { ApolloLink, QueryHookOptions, useQuery } from '@apollo/react-hooks';
import { RestLink } from 'apollo-link-rest';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { DocumentNode } from 'graphql';
import { makeGraphQLError, makeNetworkError, makeNodeError } from '../components';
import { useErrorContext } from '../hooks';
import { VariantQueryErrorResult } from '../types';

export const buildLink = (token?: string) => {
    const timeoutLink = new ApolloLinkTimeout(30000); // 30 second timeout
    const ebiRestLink = new RestLink({ uri: 'https://www.ebi.ac.uk/ebisearch/ws/rest/' });
    const httpLink = createHttpLink({
        uri: process.env.REACT_APP_GRAPHQL_URL,
        headers: { accept: 'application/json' },
    });

    const remoteNodeErrorLink = new ApolloLink((operation, forward) => {
        return new Observable(observer => {
            const dispatcherContext = operation.getContext();
            const sub = forward(operation).subscribe({
                next: response => {
                    if (response && operation.operationName === 'GetVariants') {
                        response?.data?.getVariants.errors.map((e: VariantQueryErrorResult) =>
                            dispatcherContext.dispatch(makeNodeError(e))
                        );
                    }
                    observer.next(response);
                },
            });

            return () => {
                if (sub) sub.unsubscribe();
            };
        });
    });

    const errorLink = onError(({ graphQLErrors, networkError, operation, response, forward }) => {
        const { dispatch } = operation.getContext();
        const sources = operation.variables.input.sources;

        if (graphQLErrors) {
            graphQLErrors.forEach(graphQLError => {
                const { message, locations, path } = graphQLError;
                console.error(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                );
                graphQLError.message = `${message} (Source: ${sources.join(', ')})`;
                dispatch(makeGraphQLError(graphQLError));
            });
        }

        if (networkError) {
            console.error(`[Network error]: ${networkError}`);
            networkError.message = `${networkError.message} (Source: ${sources.join(', ')})`;
            dispatch(makeNetworkError(networkError));
        }

        return forward(operation);
    });

    const authLink = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers = {} }) => ({
            headers: {
                ...headers,
                authorization: `Bearer ${token}`,
            },
        }));

        return forward(operation);
    });

    return from([ebiRestLink, authLink, errorLink, timeoutLink, remoteNodeErrorLink, httpLink]);
};

export const client = new ApolloClient<any>({
    link: buildLink(),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            nextFetchPolicy: 'cache-only',
        },
    },
});

export const useApolloQuery = <T, V>(query: DocumentNode, options: QueryHookOptions<T, V> = {}) => {
    const { dispatch } = useErrorContext();
    return useQuery<T, V>(query, {
        client,
        context: { dispatch },
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        ...options,
    });
};

export const useLazyApolloQuery = <T, V>(
    query: DocumentNode,
    options: QueryHookOptions<T, V> = {}
) => {
    const { dispatch } = useErrorContext();

    return useLazyQuery<T, V>(query, {
        client,
        context: { dispatch },
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        ...options,
    });
};
