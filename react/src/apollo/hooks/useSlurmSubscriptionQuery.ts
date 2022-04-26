import { gql } from '@apollo/react-hooks';
import { TestId } from '../../types';
import { useApolloSubscription } from '../client';

const fetchSlurmSubscription = gql`
    subscription OnSlurmResponse($input: TestId) {
        slurmResponse(input: $input) {
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
    >(fetchSlurmSubscription, {
        variables: { id: 100 }
    });

export default useSlurmSubscription;
