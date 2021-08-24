import {
    ApolloClient,
    createHttpLink,
    from,
    InMemoryCache,
    ServerError,
    ServerParseError,
    useLazyQuery,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { ApolloLink, QueryHookOptions, useQuery } from '@apollo/react-hooks';
import { RestLink } from 'apollo-link-rest';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { DocumentNode } from 'graphql';
import { makeGraphQLError, makeNetworkError, makeNodeError } from '../components';
import { useErrorContext } from '../hooks';

const port = process.env.REACT_APP_API_PORT,
    host = process.env.REACT_APP_API_HOST;

export const buildLink = (token?: string) => {
    const timeoutLink = new ApolloLinkTimeout(30000); // 30 second timeout
    const ebiRestLink = new RestLink({ uri: 'https://www.ebi.ac.uk/ebisearch/ws/rest/' });
    const httpLink = createHttpLink({
        uri: `http://${host}:${port}/graphql`,
        headers: { accept: 'application/json' },
    });

    const errorLink = onError(({ graphQLErrors, networkError, operation, response, forward }) => {
        const { dispatch } = operation.getContext();
        /**
         * Any errors besides strictly network errors often get passed to both response and graphQLErrors.
         * Here we want to check that only typings errors in the GraphQL schema get passed into graphQL errors.
         * The rest will get passed to response and classified as node errors.
         */

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
            dispatch(makeNetworkError(networkError as ServerError | ServerParseError));
        }

        console.log('ops', operation);
        console.log('res', response);

        if (response && !response?.data?.getVariants) {
            // Check if node error is the same as graphql
            response.errors?.map(e => dispatch(makeNodeError(e)));
        }

        /* if (operation.query.definitions.has.is.getVariants.query && response?.data.flatMap(r => r.errors).filter(Boolean).length) {
            dispatch(makeAddRemoteNodeError(remoteNodeError));
        } */

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

    return from([ebiRestLink, authLink, errorLink, timeoutLink, httpLink]);
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
