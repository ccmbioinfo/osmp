import { gql } from '@apollo/react-hooks';
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
        {}
    >(fetchSlurmSubscription);

export default useSlurmSubscription;
