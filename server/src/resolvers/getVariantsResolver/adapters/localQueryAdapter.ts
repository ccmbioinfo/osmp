import { v4 as uuidv4 } from 'uuid';
import {
  ErrorTransformer,
  QueryInput,
  ResultTransformer,
  VariantQueryResponse,
} from '../../../types';
import resolveAssembly from '../utils/resolveAssembly';

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
const getLocalQuery = async (args: QueryInput): Promise<VariantQueryResponse> => {
  let localQueryResponse: LocalQueryResponse[] | null = null;
  let localQueryError: Error | null = null;
  try {
    localQueryResponse = await new Promise<LocalQueryResponse[]>(resolve => {
      resolve(
        Array(1)
          .fill(null)
          .map(() => {
            return {
              alternative: 'T',
              reference: 'C',
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
        assemblyId: resolveAssembly('GRCh37'),
        callsets: [],
        end: 50162978 + i,
        info: {},
        ref: r.reference,
        referenceName: '1', // this should be referenceName
        start: 50162978 + i,
      },
      contactInfo: 'DrExample@gmail.com',
    }));
  }
};

export const transformLocalErrorResponse: ErrorTransformer<Error> = error => {
  if (!error) {
    return undefined;
  } else {
    return { code: 424, message: error.message || '', id: uuidv4() };
  }
};

export default getLocalQuery;
