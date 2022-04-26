import { gql } from '@apollo/react-hooks';
import { TestId } from '../../types';
import { useApolloSubscription } from '../client';

const fetchSlurmSubscription = gql`
    subscription OnSlurmResponse {
        slurmResponse {
            id
        }
    }
`;

const useSlurmSubscription = () =>
    useApolloSubscription<
        {
            slurmResponse: {
                id: number;
            };
        },
        TestId
    >(fetchSlurmSubscription, {});

export default useSlurmSubscription;
