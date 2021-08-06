import { ApolloClient, createHttpLink, from, InMemoryCache, useLazyQuery } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { QueryHookOptions, useQuery } from '@apollo/react-hooks';
import { RestLink } from 'apollo-link-rest';
import { DocumentNode } from 'graphql';

const port = process.env.REACT_APP_API_PORT,
    host = process.env.REACT_APP_API_HOST;

const errorLink = onError(({ graphQLErrors, networkError, operation, response, forward }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
        );
    }

    if (networkError) {
        console.error(`[Network error]: ${networkError}`);
    }

    return forward(operation);
});

const httpLink = createHttpLink({
    uri: `http://${host}:${port}/graphql`,
    headers: { Authorization: 'placeholder', accept: 'application/json' },
});

const restLink = new RestLink({ uri: 'https://www.ebi.ac.uk/ebisearch/ws/rest/' });

export const client = new ApolloClient<any>({
    link: from([restLink, errorLink, httpLink]),
    cache: new InMemoryCache(),
});

export const useApolloQuery = <T, V>(query: DocumentNode, options: QueryHookOptions<T, V> = {}) => {
    return useQuery<T, V>(query, {
        client,
        fetchPolicy: 'cache-first',
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
