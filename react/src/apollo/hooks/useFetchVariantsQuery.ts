import { gql } from '@apollo/react-hooks';
import { VariantQueryInput, VariantQueryResponse } from '../../types';
import { useApolloQuery } from '../client';

const fetchVariantsQuery = gql`
    query GetVariants($input: VariantQueryInput) {
        getVariants(input: $input) {
            data {
                data {
                    af
                    alt
                    ref
                    chromosome
                }
                source
            }
            errors {
                source
                error {
                    code
                    message
                }
            }
            meta
        }
    }
`;

const useFetchVariantsQuery = (variables: VariantQueryInput) => {
    return useApolloQuery<{ getVariants: VariantQueryResponse }, VariantQueryInput>(
        fetchVariantsQuery,
        {
            variables,
        }
    );
};

export default useFetchVariantsQuery;
