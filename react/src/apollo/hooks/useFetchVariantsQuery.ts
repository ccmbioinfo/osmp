import { gql } from '@apollo/react-hooks';
import { CombinedVariantQueryResponse, QueryInput } from '../../types';
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
                                gq
                                qual
                                zygosity
                            }
                        }
                        end
                        info {
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
                        refSeqId
                        start
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
    return useLazyApolloQuery<{ getVariants: CombinedVariantQueryResponse }, QueryInput>(
        fetchVariantsQuery
    );
};

export default useFetchVariantsQuery;
