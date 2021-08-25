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
import { isGetVariantsQueryResponse } from '../types';

const port = process.env.REACT_APP_API_PORT,
    host = process.env.REACT_APP_API_HOST;

export const buildLink = (token?: string) => {
    const timeoutLink = new ApolloLinkTimeout(30000); // 30 second timeout
    const ebiRestLink = new RestLink({ uri: 'https://www.ebi.ac.uk/ebisearch/ws/rest/' });
    const httpLink = createHttpLink({
        uri: `http://${host}:${port}/graphql`,
        headers: { accept: 'application/json' },
    });

    const remoteNodeErrorLink = new ApolloLink((operation, forward) => {
        return new Observable(observer => {
            const sub = forward(operation).subscribe({
                next: response => {
                    if (response && isGetVariantsQueryResponse(response)) {
                        response.data?.getVariants.errors.map(e =>
                            operation.getContext().dispatch(makeNodeError(e))
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

        if (graphQLErrors && response?.data?.getVariants) {
            graphQLErrors.forEach(graphQLError => {
                const { message, locations, path } = graphQLError;
                console.error(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                );
                dispatch(makeGraphQLError(graphQLError));
            });
        }

        if (networkError) {
            console.error(`[Network error]: ${networkError}`);
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

    return from([ebiRestLink, authLink, remoteNodeErrorLink, errorLink, timeoutLink, httpLink]);
};

export const client = new ApolloClient<any>({
    link: buildLink(),
    cache: new InMemoryCache(),
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
