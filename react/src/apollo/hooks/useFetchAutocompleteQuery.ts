import gql from 'graphql-tag';
import { useLazyApolloQuery } from '../client';

/* 
    fetch autocomplete results with ensembl id and genomic position 
*/
const autocompleteQuery = gql`
    query FetchAutocomplete($q: String) {
        autocompleteResults(q: $q)
            @rest(
                type: "AutoCompleteSuggestion"
                path: "query?species=human&fields=genomic_pos_hg19,symbol,genomic_pos,ensembl.gene&{args}"
            ) {
            hits {
                symbol
                ensembl {
                    gene
                }
                genomic_pos {
                    chr
                    end
                    start
                }
                genomic_pos_hg19 {
                    chr
                    end
                    start
                }
            }
        }
    }
`;

const useFetchAutocompleteQuery = () =>
    useLazyApolloQuery<
        {
            autocompleteResults: {
                hits: {
                    symbol: string;
                    ensembl: { gene: string };
                    genomic_pos: {
                        chr: string;
                        end: number;
                        start: number;
                    };
                    genomic_pos_hg19: {
                        chr: string;
                        end: number;
                        start: number;
                    };
                }[];
            };
        },
        { q: string }
    >(autocompleteQuery);

export default useFetchAutocompleteQuery;
