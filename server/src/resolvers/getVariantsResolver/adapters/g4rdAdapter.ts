import axios, { AxiosError, AxiosResponse } from 'axios';
import https from 'https';
import jwtDecode from 'jwt-decode';
import { URLSearchParams } from 'url';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../../logger';
import {
  ErrorTransformer,
  IndividualResponseFields,
  QueryInput,
  ResultTransformer,
  VariantQueryResponse,
  VariantResponseFields,
} from '../../../types';
import { getFromCache, putInCache } from '../../../utils/cache';

/* eslint-disable camelcase */

const SOURCE_NAME = 'g4rd';
const BEARER_CACHE_KEY = 'g4rdToken';

type G4RDNodeQueryError = AxiosError<string>;

type G4RDVariantBaseResponseFields = Omit<VariantResponseFields, 'referenceName'>;

interface G4RDVariantInfoFields {
  geneName: string;
  aaChanges: string;
  transcript: string;
  gnomadHom: number;
  cdna: string;
}

export interface G4RDQueryResult {
  exists: boolean;
  numTotalResults: number;
  results: {
    contactInfo: string;
    individual: Pick<
      IndividualResponseFields,
      'individualId' | 'diseases' | 'sex' | 'phenotypicFeatures'
    >;
    variant: G4RDVariantBaseResponseFields & { refseqId: string } & { info: G4RDVariantInfoFields };
  }[];
}

/**
 * @param args VariantQueryInput
 * @returns  Promise<ResolvedVariantQueryResult>
 */
const getG4rdNodeQuery = async ({
  input: { gene: geneInput, variant },
}: QueryInput): Promise<VariantQueryResponse> => {
  let G4RDNodeQueryError: G4RDNodeQueryError | null = null;
  let G4RDNodeQueryResponse: null | AxiosResponse<G4RDQueryResult> = null;
  let Authorization = '';
  try {
    Authorization = await getAuthHeader();
  } catch (e) {
    logger.error(e);
    logger.error(e?.resoponse?.data);
    return {
      data: [],
      error: { code: 403, message: 'ERROR FETCHING OAUTH TOKEN', id: uuidv4() },
      source: SOURCE_NAME,
    };
  }
  const url = `${process.env.G4RD_URL}/rest/variants/match`;
  const { position, ...gene } = geneInput;
  try {
    G4RDNodeQueryResponse = await axios.post<G4RDQueryResult>(
      url,
      {
        gene,
        variant,
      },
      {
        headers: { Authorization, 'Content-Type': 'application/json', Accept: 'application/json' },
      }
    );
  } catch (e) {
    logger.error(e);
    G4RDNodeQueryError = e;
  }

  return {
    data: transformG4RDQueryResponse(
      (G4RDNodeQueryResponse?.data as G4RDQueryResult) || [],
      position
    ),
    error: transformG4RDNodeErrorResponse(G4RDNodeQueryError),
    source: SOURCE_NAME,
  };
};

const getAuthHeader = async () => {
  const {
    G4RD_USERNAME: username,
    G4RD_PASSWORD: password,
    G4RD_TOKEN_URL,
    G4RD_URL,
    G4RD_REALM: realm,
    G4RD_CLIENT_ID: client_id,
    G4RD_GRANT_TYPE: grant_type,
  } = process.env;
  if (process.env.G4RD_AUTH_METHOD === 'basic') {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  } else if (process.env.G4RD_AUTH_METHOD === 'bearer') {
    const cachedToken = getFromCache(BEARER_CACHE_KEY);
    if (cachedToken) {
      return `Bearer ${cachedToken}`;
    }

    const params = new URLSearchParams({
      audience: `${G4RD_URL}/rest/`,
      client_id: client_id,
      grant_type,
      password,
      realm,
      scope: 'openid profile email',
      username,
    } as Record<string, string>);

    const tokenResponse = await axios.post<{ id_token: string }>(G4RD_TOKEN_URL!, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: '*/*' },
    });
    const token = tokenResponse.data.id_token; // docs say to use id_token, not bearer_token
    const decoded = jwtDecode<{ iat: number; exp: number }>(token);
    const ttl = decoded.exp - Date.now() / 1000;
    putInCache(BEARER_CACHE_KEY, token, ttl);
    return `Bearer ${token}`;
  } else {
    throw new Error(`NO AUTH METHOD CONFIGURED FOR ${SOURCE_NAME}!`);
  }
};

export const transformG4RDNodeErrorResponse: ErrorTransformer<G4RDNodeQueryError> = error => {
  if (!error) {
    return undefined;
  } else {
    return {
      id: uuidv4(),
      code: error.response?.status || 500,
      message: error.response?.data.toString(),
    };
  }
};

export const transformG4RDQueryResponse: ResultTransformer<G4RDQueryResult> = (
  response,
  position: string
) => {
  return (response.results || []).map(r => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { refseqId, ...restVariant } = r.variant;
    const { individual, contactInfo } = r;
    const { aaChanges, ...restVariantInfo } = restVariant.info;

    const variant: VariantResponseFields = {
      ...restVariant,
      info: restVariantInfo,
      referenceName: position.split(':')[0],
    };

    return { individual, variant, contactInfo, source: SOURCE_NAME };
  });
};

export default getG4rdNodeQuery;
