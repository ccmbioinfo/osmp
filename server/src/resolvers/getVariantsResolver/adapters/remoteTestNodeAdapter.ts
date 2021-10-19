import axios, { AxiosError, AxiosResponse } from 'axios';
import { PubSub } from 'graphql-subscriptions';
import { QUERY_RESOLVED } from '../..';
import logger from '../../../logger';
import {
  ErrorTransformer,
  QueryInput,
  ResolvedVariantQueryResult,
  VariantQueryResponseSchema,
} from '../../../types';
import { v4 as uuidv4 } from 'uuid';

type RemoteTestNodeQueryError = AxiosError;

/**
 * @param args VariantQueryInput
 * @returns  Promise<ResolvedVariantQueryResult>
 * Return some dummy data for testing and design purposes
 */
const getRemoteTestNodeQuery = async (
  args: QueryInput,
  pubsub: PubSub
): Promise<ResolvedVariantQueryResult> => {
  /* eslint-disable camelcase */
  let tokenResponse: AxiosResponse<{ access_token: string }>;

  if (process.env.TEST_NODE_OAUTH_ACTIVE === 'true') {
    try {
      tokenResponse = await axios.post(
        process.env.TEST_NODE_SSMP_TOKEN_ENDPOINT!,
        {
          client_id: process.env.TEST_NODE_SSMP_TOKEN_CLIENT_ID,
          client_secret: process.env.TEST_NODE_SSMP_TOKEN_CLIENT_SECRET,
          audience: process.env.TEST_NODE_TOKEN_AUDIENCE,
          grant_type: 'client_credentials',
        },
        { headers: { 'content-type': 'application/json' } }
      );
    } catch (e) {
      logger.error(e);
      return {
        data: [],
        error: { code: 403, message: 'ERROR FETCHING OAUTH TOKEN', id: uuidv4() },
        source: 'remote-test',
      };
    }
  } else {
    tokenResponse = { data: { access_token: 'abc' } } as any;
  }

  let remoteTestNodeQueryResponse = null;
  let remoteTestNodeQueryError: RemoteTestNodeQueryError | null = null;

  try {
    remoteTestNodeQueryResponse = await axios.get(
      `${process.env.TEST_NODE_URL}?ensemblId=${args.input.gene.ensemblId}`,
      {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
      }
    );
  } catch (e) {
    logger.error(e);
    remoteTestNodeQueryError = e as AxiosError;
  }

  // todo: wrap and make type safe
  pubsub.publish(QUERY_RESOLVED, { queryResolved: { node: 'remote-test' } });

  return {
<<<<<<< HEAD
    data: remoteTestNodeQueryResponse?.data as VariantQueryResponseSchema[] || [],
=======
    data: (remoteTestNodeQueryResponse?.data as VariantQueryResponseSchema[]) || [],
>>>>>>> develop
    error: transformRemoteTestNodeErrorResponse(remoteTestNodeQueryError),
    source: 'remote-test',
  };
};

export const transformRemoteTestNodeErrorResponse: ErrorTransformer<AxiosError> = error => {
  if (!error) {
    return null;
  } else {
    return {
      id: uuidv4(),
      code: error.response?.status || 500,
      message: error.response?.data as string | null | undefined,
    };
  }
};

export default getRemoteTestNodeQuery;
