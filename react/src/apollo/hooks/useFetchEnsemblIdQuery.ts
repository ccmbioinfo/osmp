import gql from 'graphql-tag';
import { useLazyApolloQuery } from '../client';

const ensemblIdQuery = gql`
    query FetchEnsemblId($query: String) {
        fetchEnsemblIdResults(query: $query)
            @rest(type: "EnsemblId", path: "ensembl_gene?{args}&size=1") {
            entries {
                id
            }
        }
    }
`;

const useFetchEnsemblIdQuery = () =>
    useLazyApolloQuery<{ fetchEnsemblIdResults: { entries: { id: string }[] } }, { query: string }>(
        ensemblIdQuery
    );

export default useFetchEnsemblIdQuery;
