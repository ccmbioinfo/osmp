import { gql } from '@apollo/react-hooks';
import { VariantQueryInput, VariantQueryResponse } from '../../types';
import { useLazyApolloQuery } from '../client';

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

const useFetchVariantsQuery = () => {
    return useLazyApolloQuery<{ getVariants: VariantQueryResponse }, VariantQueryInput>(
        fetchVariantsQuery
    );
};

export default useFetchVariantsQuery;
