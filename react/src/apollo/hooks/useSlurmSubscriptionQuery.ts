import { gql } from '@apollo/react-hooks';
import { useApolloSubscription } from '../client';

const fetchSlurmSubscription = gql`
    subscription OnSlurmResponse() {
        slurmResponse() {
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
// useApolloSubscription<{ slurmResponse { id: Int }}, {}>(fetchSlurmSubscription);

export default useSlurmSubscription;
