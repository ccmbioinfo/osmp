import { gql } from '@apollo/react-hooks';
import { QueryInput, VariantQueryResponse } from '../../types';
import { useLazyApolloQuery } from '../client';

const fetchVariantsQuery = gql`
    query GetVariants($input: QueryInput) {
        getVariants(input: $input) {
            data {
                data {
                    variant {
                        alt
                        callsets {
                            callSetId
                            individualId
                            info {
                                ad
                                dp
                                zygosity
                            }
                        }
                        end
                        info {
                            aaChanges
                            cDna
                            geneName
                            gnomadHet
                            gnomadHom
                            transcript
                        }
                        ref
                        refSeqId
                        start
                    }
                    individual {
                        datasetId
                        ethnicity
                        individualId
                        phenotypicFeatures {
                            phenotypeId
                        }
                        sex
                    }
                    contactInfo
                }
                source
            }
            errors {
                error {
                    id
                    code
                    message
                }
                source
            }
            meta
        }
    }
`;

const useFetchVariantsQuery = () => {
    return useLazyApolloQuery<{ getVariants: VariantQueryResponse }, QueryInput>(
        fetchVariantsQuery
    );
};

export default useFetchVariantsQuery;
