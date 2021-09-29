import gql from 'graphql-tag';
import { useLazyApolloQuery } from '../client';

const autocompleteQuery = gql`
    query FetchAutocomplete($q: String) {
        autocompleteResults(q: $q)
            @rest(
                type: "AutoCompleteSuggestion"
                path: "query?species=human&fields=symbol,ensembl.gene&{args}"
            ) {
            hits {
                symbol
                ensembl {
                    gene
                }
            }
        }
    }
`;

const useFetchAutocompleteQuery = () =>
    useLazyApolloQuery<
        { autocompleteResults: { hits: { symbol: string; ensembl: { gene: string } }[] } },
        { q: string }
    >(autocompleteQuery);

export default useFetchAutocompleteQuery;
