import { ApolloClient, createHttpLink, from, InMemoryCache, useLazyQuery } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { relayStylePagination } from '@apollo/client/utilities';
import { ApolloLink, QueryHookOptions, ServerError, useQuery } from '@apollo/react-hooks';
import { RestLink } from 'apollo-link-rest';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { DocumentNode } from 'graphql';
import { makeGraphQLError, makeNetworkError, makeNodeError } from '../components';
import { useErrorContext } from '../hooks';
import { VariantQueryResponseError } from '../types';

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL;

export const buildLink = (token?: string) => {
    const timeoutLink = new ApolloLinkTimeout(90_000); // 90 second timeout
    const mygeneRestLink = new RestLink({
        uri: 'https://mygene.info/v3/',
    });
    const httpLink = createHttpLink({
        uri: GRAPHQL_URL,
        headers: { accept: 'application/json' },
    });

    const remoteNodeErrorLink = new ApolloLink((operation, forward) => {
        return forward(operation).map(result => {
            // https://github.com/apollographql/apollo-link/issues/298
            const errorDispatch = operation.getContext().dispatch;
            if (result.data?.getVariants.errors.length) {
                result.data?.getVariants.errors.forEach((e: VariantQueryResponseError) => {
                    console.error(`[Node Error]: ${e.error.message}`);
                    let formatErr = { ...e };
                    if (e.source === 'CADD annotations' && Number(e.error.code) >= 500) {
                        formatErr.error.message =
                            'Failed to fetch CADD annotations. Annotating with gnomAD only!';
                    }
                    errorDispatch(makeNodeError(formatErr));
                });
            }
            return result;
        });
    });

    const errorLink = onError(errorResponse => {
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
            if ((networkError as ServerError).statusCode === 403) {
                networkError.message = `${networkError.message} Refreshing...`;
                setTimeout(() => {
                    window.location.reload();
                }, 3_000);
            }
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
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    autocompleteResults: relayStylePagination(),
                },
            },
        },
    }),
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
        notifyOnNetworkStatusChange: true,
        ...options,
    });
};
