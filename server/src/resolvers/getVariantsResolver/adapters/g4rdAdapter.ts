import axios, { AxiosError, AxiosResponse } from 'axios';
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
  G4RDFamilyQueryResult,
  G4RDPatientQueryResult,
  G4RDVariantQueryResult,
  IndividualInfoFields,
} from '../../../types';
import { getFromCache, putInCache } from '../../../utils/cache';
import resolveAssembly from '../utils/resolveAssembly';

/* eslint-disable camelcase */

const SOURCE_NAME = 'g4rd';
const BEARER_CACHE_KEY = 'g4rdToken';

type G4RDNodeQueryError = AxiosError<string>;

/**
 * @param args VariantQueryInput
 * @returns  Promise<ResolvedVariantQueryResult>
 */
const getG4rdNodeQuery = async ({
  input: { gene: geneInput, variant },
}: QueryInput): Promise<VariantQueryResponse> => {
  let G4RDNodeQueryError: G4RDNodeQueryError | null = null;
  let G4RDVariantQueryResponse: null | AxiosResponse<G4RDVariantQueryResult> = null;
  let G4RDPatientQueryResponse: null | AxiosResponse<G4RDPatientQueryResult> = null;
  const FamilyIds: null | Record<string, string> = {}; // <PatientId, FamilyId>
  let Authorization = '';
  try {
    Authorization = await getAuthHeader();
  } catch (e: any) {
    logger.error(e);
    logger.error(e?.resoponse?.data);
    return {
      data: [],
      error: { code: 403, message: 'ERROR FETCHING OAUTH TOKEN', id: uuidv4() },
      source: SOURCE_NAME,
    };
  }
  const url = `${process.env.G4RD_URL}/rest/variants/match`;
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { position, ...gene } = geneInput;
  variant.assemblyId = 'GRCh37';
  // For g4rd node, assemblyId is a required field as specified in this sample request:
  // https://github.com/ccmbioinfo/report-scripts/blob/master/docs/phenotips-api.md#matching-endpoint
  // assemblyId is set to be GRCh37 because g4rd node only contains data in assembly GRCh37.
  try {
    G4RDVariantQueryResponse = await axios.post<G4RDVariantQueryResult>(
      url,
      {
        gene,
        variant,
      },
      {
        headers: { Authorization, 'Content-Type': 'application/json', Accept: 'application/json' },
      }
    );

    // Get patients info
    if (G4RDVariantQueryResponse) {
      let individualIds = G4RDVariantQueryResponse.data.results
        .map(v => v.individual.individualId!)
        .filter(Boolean); // Filter out undefined and null values.

      // Get all unique individual Ids.
      individualIds = [...new Set(individualIds)];

      if (individualIds.length > 0) {
        const patientUrl = `${process.env.G4RD_URL}/rest/patients/fetch?${individualIds
          .map(id => `id=${id}`)
          .join('&')}`;

        G4RDPatientQueryResponse = await axios.get<G4RDPatientQueryResult>(
          new URL(patientUrl).toString(),
          {
            headers: {
              Authorization,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        // Get Family Id for each patient.
        const patientFamily = axios.create({
          headers: {
            Authorization,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const familyResponses = await Promise.allSettled(
          individualIds.map(id =>
            patientFamily.get<G4RDFamilyQueryResult>(
              new URL(`${process.env.G4RD_URL}/rest/patients/${id}/family`).toString()
            )
          )
        );

        familyResponses.forEach((response, index) => {
          if (response.status === 'fulfilled' && response.value.status === 200) {
            FamilyIds[individualIds[index]] = response.value.data.id;
          }
        });
      }
    }
  } catch (e: any) {
    logger.error(e);
    G4RDNodeQueryError = e;
  }

  return {
    data: transformG4RDQueryResponse(
      (G4RDVariantQueryResponse?.data as G4RDVariantQueryResult) || [],
      (G4RDPatientQueryResponse?.data as G4RDPatientQueryResult) || [],
      FamilyIds
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
      message:
        error.response?.status === 404
          ? 'No variants found matching your query.'
          : error.response?.statusText,
    };
  }
};

export const transformG4RDQueryResponse: ResultTransformer<G4RDVariantQueryResult> = (
  variantResponse,
  patientResponse: G4RDPatientQueryResult[],
  familyIds: Record<string, string>
) => {
  const individualIdsMap = Object.fromEntries(patientResponse.map(p => [p.id, p]));

  return (variantResponse.results || []).map(r => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    r.variant.assemblyId = resolveAssembly(r.variant.assemblyId);
    const { individual, contactInfo } = r;

    const patient = individual.individualId ? individualIdsMap[individual.individualId] : null;

    let info: IndividualInfoFields = {};
    let ethnicity: string = '';

    if (patient) {
      const candidateGene = (patient.genes ?? []).map(g => g.gene).join('\n');
      const classifications = (patient.genes ?? []).map(g => g.status).join('\n');
      const diagnosis = patient.clinicalStatus;
      const solved = patient.solved ? patient.solved.status : '';
      const clinicalStatus = patient.clinicalStatus;
      ethnicity = Object.values(patient.ethnicity)
        .flat()
        .map(p => p.trim())
        .join(', ');
      info = {
        solved,
        candidateGene,
        diagnosis,
        classifications,
        clinicalStatus,
      };
    }

    const variant: VariantResponseFields = {
      alt: r.variant.alt,
      assemblyId: r.variant.assemblyId,
      callsets: r.variant.callsets,
      end: r.variant.end,
      ref: r.variant.ref,
      start: r.variant.start,
      chromosome: r.variant.chromosome,
    };

    let familyId: string = '';
    if (individual.individualId) familyId = familyIds[individual.individualId];

    const individualResponseFields: IndividualResponseFields = {
      ...individual,
      ethnicity,
      info,
      familyId,
    };
    return { individual: individualResponseFields, variant, contactInfo, source: SOURCE_NAME };
  });
};

export default getG4rdNodeQuery;
