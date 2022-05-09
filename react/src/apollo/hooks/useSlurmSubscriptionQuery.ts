import { gql } from '@apollo/react-hooks';
import { SlurmVariantResponse } from '../../types';
import { useApolloSubscription } from '../client';

export const fetchSlurmSubscription = gql`
    subscription OnSlurmResponse {
        slurmResponse {
            jobId
            variants {
                start
                end
                referenceName
                ref
                alt
                Consequence
                oAA
                nAA
                FeatureID
                cDNApos
                protPos
                nhomalt
                an
                af
                filter
                transcript
                cdna
                amino_acids
            }
        }
    }
`;

const useSlurmSubscription = () =>
    useApolloSubscription<
        {
            jobId: number;
            variants: SlurmVariantResponse[];
        },
        {}
    >(fetchSlurmSubscription, {});

export default useSlurmSubscription;
