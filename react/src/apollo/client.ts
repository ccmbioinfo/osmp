import {
    ApolloClient,
    createHttpLink,
    from,
    InMemoryCache,
    useLazyQuery,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { ApolloLink, QueryHookOptions, useQuery } from '@apollo/react-hooks';
import { RestLink } from 'apollo-link-rest';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { DocumentNode } from 'graphql';
import { makeGraphQLError, makeNetworkError, makeNodeError } from '../components';
import { useErrorContext } from '../hooks';
import { VariantQueryResponseError } from '../types';

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL;

export const buildLink = (token?: string) => {
    const timeoutLink = new ApolloLinkTimeout(60_000); // 60 second timeout
    const mygeneRestLink = new RestLink({
        uri: 'https://mygene.info/v3/',
    });
    const httpLink = createHttpLink({
        uri: GRAPHQL_URL,
        headers: { accept: 'application/json' },
    });

    const remoteNodeErrorLink = new ApolloLink((operation, forward) => {
        return forward(operation).map((result) => {
            const errorDispatch = operation.getContext().dispatch;
            // const errorDispatch = result.context!.dispatch;  // Is this more 'correct'?
            if (result.data?.getVariants.errors.length) {
                result.data?.getVariants.errors.forEach(
                    (e: VariantQueryResponseError) => {
                        errorDispatch(makeNodeError(e));
                    }
                );
            }
            return result;
        });
    });

    const errorLink = onError((errorResponse) => {
        const { graphQLErrors, networkError, operation, /*response, */ forward } = errorResponse;
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

    return from([mygeneRestLink, authLink, errorLink, timeoutLink, remoteNodeErrorLink, httpLink]);
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
