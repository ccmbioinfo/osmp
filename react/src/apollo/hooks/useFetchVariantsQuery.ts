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
                    chromosome
                    datasetId
                    dp
                    end
                    ethnicity
                    phenotypes
                    ref
                    rsId
                    sex
                    someFakeScore
                    start
                    zygosity
                }
                source
            }
            errors {
                error {
                    code
                    message
                }
            }
            meta
        }
    }
`;

const useFetchVariantsQuery = () =>
    useLazyApolloQuery<{ getVariants: VariantQueryResponse }, VariantQueryInput>(
        fetchVariantsQuery
    );

export default useFetchVariantsQuery;
