import { gql } from '@apollo/react-hooks';
import { CombinedVariantQueryResponse, QueryInput } from '../../types';
import { useLazyApolloQuery } from '../client';

const fetchVariantsQuery = gql`
    query GetVariants($input: QueryInput) {
        getVariants(input: $input) {
            data {
                variant {
                    alt
                    assemblyId
                    callsets {
                        callsetId
                        individualId
                        info {
                            ad
                            dp
                            gq
                            qual
                            zygosity
                        }
                    }
                    end
                    info {
                        af
                        aaAlt
                        aaPos
                        aaRef
                        cdna
                        consequence
                        geneName
                        gnomadHet
                        gnomadHom
                        transcript
                    }
                    ref
                    referenceName
                    start
                    variantId
                }
                individual {
                    datasetId
                    diseases {
                        ageOfOnset {
                            age
                            ageGroup
                        }
                        description
                        diseaseId
                        diseaseLabel
                        levelSeverity
                        outcome
                        stage
                    }
                    ethnicity
                    geographicOrigin
                    individualId
                    info {
                        diagnosis
                        candidateGene
                        solved
                        classifications
                    }
                    phenotypicFeatures {
                        ageOfOnset {
                            age
                            ageGroup
                        }
                        dateOfOnset
                        levelSeverity
                        onsetType
                        phenotypeId
                        phenotypeLabel
                    }
                    sex
                }
                contactInfo
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
        }
    }
`;

const useFetchVariantsQuery = () => {
    return useLazyApolloQuery<{ getVariants: CombinedVariantQueryResponse }, QueryInput>(
        fetchVariantsQuery
    );
};

export default useFetchVariantsQuery;
