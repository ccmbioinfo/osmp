import gql from 'graphql-tag';
import { useLazyApolloQuery } from '../client';

/* 
    fetch autocomplete results with ensembl id and genomic position 
    note that position is given according to GRCh38 assembly and may need to be converted
*/
const autocompleteQuery = gql`
    query FetchAutocomplete($q: String) {
        autocompleteResults(q: $q)
            @rest(
                type: "AutoCompleteSuggestion"
                path: "query?species=human&fields=symbol,genomic_pos,ensembl.gene&{args}"
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
                    strand
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
                        strand: number;
                    };
                }[];
            };
        },
        { q: string }
    >(autocompleteQuery);

export default useFetchAutocompleteQuery;
