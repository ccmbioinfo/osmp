import {
    ApolloClient,
    ApolloLink,
    createHttpLink,
    from,
    InMemoryCache,
    NextLink,
    Observable,
    Operation,
    QueryHookOptions,
    split,
    SubscriptionHookOptions,
    useLazyQuery,
    useQuery,
    useSubscription,
} from '@apollo/client';

import { GraphQLWsLink } from '@apollo/client/link/subscriptions';

import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/link-error';
import { RestLink } from 'apollo-link-rest';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { DocumentNode } from 'graphql';
import { createClient } from 'graphql-ws';
import { makeGraphQLError, makeNetworkError, makeNodeError } from '../components';
import { useErrorContext } from '../hooks';
import { VariantQueryResponseError } from '../types';

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL;

export const buildLink = (token?: string) => {
    const timeoutLink = new ApolloLinkTimeout(60000); // 60 second timeout
    const mygeneRestLink = new RestLink({
        uri: 'https://mygene.info/v3/',
    });
    const httpLink = createHttpLink({
        uri: GRAPHQL_URL,
        headers: { accept: 'application/json' },
    });

    const wsLink = new GraphQLWsLink(
        createClient({
            url: `ws://localhost:5862/graphql`,
        })
    );

    const splitLink = split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
            );
        },
        wsLink,
        httpLink
    );

    const remoteNodeErrorLink = new ApolloLink((operation: Operation, forward: NextLink) => {
        return new Observable(observer => {
            const dispatcherContext = operation.getContext();
            const sub = forward(operation).subscribe({
                next: response => {
                    if (!!response?.data?.getVariants?.errors.length) {
                        response?.data?.getVariants.errors.forEach(
                            (e: VariantQueryResponseError) => {
                                dispatcherContext.dispatch(makeNodeError(e));
                            }
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
        const sources = operation.variables.input.sources || [];

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

    const authLink = new ApolloLink((operation: Operation, forward: NextLink) => {
        operation.setContext(({ headers = {} }) => ({
            headers: {
                ...headers,
                authorization: `Bearer ${token}`,
            },
        }));

        return forward(operation);
    });

    return from([mygeneRestLink, authLink, errorLink, timeoutLink, remoteNodeErrorLink, splitLink]);
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

export const useApolloSubscription = <T, V>(
    subscription: DocumentNode,
    options: SubscriptionHookOptions<T, V> = {}
) => {
    const { dispatch } = useErrorContext();

    return useSubscription<T, V>(subscription, {
        client,
        fetchPolicy: 'network-only',
        context: { dispatch },
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
