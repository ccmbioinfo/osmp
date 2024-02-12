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
                    assemblyIdCurrent
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
                        aaChange
                        af
                        ac
                        cdna
                        consequence
                        geneName
                        gnomadHom
                        phred
                        spliceAIScore
                        spliceAIType
                        transcript
                    }
                    ref
                    chromosome
                    start
                    variantId
                }
                individual {
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
                    familyId
                    geographicOrigin
                    individualId
                    info {
                        diagnosis
                        candidateGene
                        clinicalStatus
                        disorders {
                            id
                            label
                        }
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
                        observed
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
