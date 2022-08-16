import { v4 as uuidv4 } from 'uuid';
import { ErrorTransformer, ResultTransformer, VariantQueryResponse } from '../../../types';
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
const getLocalQuery = async (): Promise<VariantQueryResponse> => {
  let localQueryResponse: LocalQueryResponse[] | null = null;
  let localQueryError: Error | null = null;
  try {
    localQueryResponse = await new Promise<LocalQueryResponse[]>(resolve => {
      resolve(
        Array(5)
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
    data: transformLocalQueryResponse(localQueryResponse || []),
    error: transformLocalErrorResponse(localQueryError),
    source: 'local',
  };
};

export const transformLocalQueryResponse: ResultTransformer<LocalQueryResponse[]> = response => {
  if (!response) {
    return [];
  } else {
    return response.map(r => ({
      source: 'local',
      individual: {
        individualId: 'someTestId',
        phenotypicFeatures: Array(5)
          .fill(null)
          .map(() => ({
            ageOfOnset: {
              age: 10,
              ageGroup: 'some group',
            },
            dateOfOnset: '2021-10-10',
            levelSeverity: 'high',
            onsetType: '3',
            phenotypeId: '4',
            observed: true,
          })),
      },
      variant: {
        alt: r.alternative,
        assemblyId: resolveAssembly('GRCh37'),
        callsets: [],
        end: 50162978,
        info: {},
        ref: r.reference,
        chromosome: '1', // this should be chromosome
        start: 50162978,
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
