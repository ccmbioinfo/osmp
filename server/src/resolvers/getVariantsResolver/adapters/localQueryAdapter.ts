import { PubSub } from 'graphql-subscriptions';
import { QUERY_RESOLVED } from '../..';
import { v4 as uuidv4 } from 'uuid';
import {
  ErrorTransformer,
  QueryInput,
  ResolvedVariantQueryResult,
  ResultTransformer,
} from '../../../types';

interface LocalQueryResponse {
  reference: string;
  alternative: string;
  chromosome: string;
  extraneous: string;
}

/**
 * @param args VariantQueryInput
 * @returns  Promise<ResolvedVariantQueryResult>
 * Return some dummy data for testing and design purposes
 */
const getLocalQuery = async (
  args: QueryInput,
  pubsub: PubSub
): Promise<ResolvedVariantQueryResult> => {
  let localQueryResponse: LocalQueryResponse[] | null = null;
  let localQueryError: Error | null = null;
  try {
    localQueryResponse = await new Promise<LocalQueryResponse[]>((resolve, reject) => {
      resolve(
        Array(100)
          .fill(null)
          .map((v, i) => {
            return {
              alternative: 'T',
              reference: 'A',
              chromosome: '1',
              extraneous: 'extr',
            };
          })
      );
      // reject(new Error('test!'));
    });
  } catch (e) {
    localQueryError = e as Error;
  }

  // todo: wrap and make type safe
  pubsub.publish(QUERY_RESOLVED, { queryResolved: { node: 'local' } });

  return {
    data: transformLocalQueryResponse(localQueryResponse),
    error: transformLocalErrorResponse(localQueryError),
    source: 'local',
  };
};

export const transformLocalQueryResponse: ResultTransformer<LocalQueryResponse[]> = response => {
  if (!response) {
    return [];
  } else {
    return response.map((r, i) => ({
      individual: {
        individualId: 'testId1',
      },
      variant: {
        alt: r.alternative,
        assemblyId: 'GRCh37',
        callsets: [],
        end: 123456 + i,
        info: {},
        ref: r.reference,
        refSeqId: '1',
        start: 123456 + i,
      },
      contactInfo: 'DrExample@gmail.com',
    }));
  }
};

export const transformLocalErrorResponse: ErrorTransformer<Error> = error => {
  if (!error) {
    return null;
  } else {
    return { code: 424, message: error.message || '', id: uuidv4() };
  }
};

export default getLocalQuery;
