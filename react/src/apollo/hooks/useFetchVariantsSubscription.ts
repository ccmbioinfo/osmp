import { gql } from '@apollo/react-hooks';
import { CombinedVariantQueryResponse } from '../../types';
import { useApolloSubscription } from '../client';

const fetchVariantsSubscription = gql`
    subscription GetVariantsSubscription {
        getVariantsSubscription {
            data {
                variant {
                    alt
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

const useFetchVariantsSubscription = () =>
    useApolloSubscription<{ getVariantsSubscription: CombinedVariantQueryResponse }, {}>(
        fetchVariantsSubscription,
        {}
    );

export default useFetchVariantsSubscription;
