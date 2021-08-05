import gql from 'graphql-tag';
import { useLazyApolloQuery } from '../client';

const autocompleteQuery = gql`
    query FetchAutocomplete($term: String) {
        autocompleteResults(term: $term)
            @rest(type: "AutoCompleteSuggestion", path: "ensembl/autocomplete?{args}") {
            suggestions {
                suggestion
            }
        }
    }
`;

const useFetchAutocompleteQuery = () =>
    useLazyApolloQuery<
        { autocompleteResults: { suggestions: { suggestion: string }[] } },
        { term: string }
    >(autocompleteQuery);

export default useFetchAutocompleteQuery;
