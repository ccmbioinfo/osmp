import { ApolloClient, createHttpLink, from, InMemoryCache, useLazyQuery } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { ApolloLink, QueryHookOptions, useQuery } from '@apollo/react-hooks';
import { RestLink } from 'apollo-link-rest';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { DocumentNode } from 'graphql';

const port = process.env.REACT_APP_API_PORT,
    host = process.env.REACT_APP_API_HOST;

export const buildLink = (token?: string) => {
    const timeoutLink = new ApolloLinkTimeout(15000); // 15 second timeout
    const ebiRestLink = new RestLink({ uri: 'https://www.ebi.ac.uk/ebisearch/ws/rest/' });
    const httpLink = createHttpLink({
        uri: `http://${host}:${port}/graphql`,
        headers: { accept: 'application/json' },
    });
    const errorLink = onError(({ graphQLErrors, networkError, operation, response, forward }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) => {
                console.error(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                );
            });
        }

        if (networkError) {
            console.error(`[Network error]: ${networkError}`);
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

    return from([ebiRestLink, authLink, errorLink, httpLink].map(link => timeoutLink.concat(link)));
};

export const client = new ApolloClient<any>({
    link: buildLink(),
    cache: new InMemoryCache(),
});

export const useApolloQuery = <T, V>(query: DocumentNode, options: QueryHookOptions<T, V> = {}) => {
    return useQuery<T, V>(query, {
        client,
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
        ...options,
    });
};

export const useLazyApolloQuery = <T, V>(
    query: DocumentNode,
    options: QueryHookOptions<T, V> = {}
) => {
    return useLazyQuery<T, V>(query, {
        client,
        fetchPolicy: 'cache-first',
        ...options,
    });
};
