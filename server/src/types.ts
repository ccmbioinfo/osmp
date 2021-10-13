import { Request, Response } from 'express';
import { PubSub } from 'graphql-subscriptions';
import { Maybe } from 'graphql/jsutils/Maybe';

/* typescript types that map to graphql types, should be updated whenever schema is updated */
/* todo: these should be moved to a static file in the root so they are shared between back and front-end */
/* volume mounts will need to be adjusted (will need to mount within the named mount, though of course this won't work locally anymore) */
export interface VariantResponseInfoFields {
  aaChanges?: Maybe<string>;
  cDna?: Maybe<string>;
  geneName?: Maybe<string>;
  gnomadHet?: Maybe<number>;
  gnomadHom?: Maybe<number>;
  transcript?: Maybe<string>;
}

export interface CallsetInfoFields {
  ad?: Maybe<number>;
  dp?: Maybe<number>;
  gq?: Maybe<number>;
  qual?: Maybe<number>;
  zygosity?: Maybe<string>;
}

export interface CallSet {
  callSetId: string;
  individualId: string;
  info: CallsetInfoFields;
}

export interface VariantResponseFields {
  alt: string;
  assemblyId: Maybe<string>;
  callsets: CallSet[];
  end: number;
  info?: Maybe<VariantResponseInfoFields>;
  ref: string;
  refSeqId: string;
  start: number;
  variantType?: Maybe<string>;
}

export interface AgeOfOnsetFields {
  age: Maybe<number>;
  ageGroup: Maybe<String>;
}

export interface PhenotypicFeaturesFields {
  ageOfOnset?: Maybe<AgeOfOnsetFields>;
  dateOfOnset?: Maybe<string>;
  levelSeverity?: Maybe<string>;
  onsetType?: Maybe<string>;
  phenotypeId?: Maybe<string>;
}

export interface DiseaseFields {
  ageOfOnset?: Maybe<AgeOfOnsetFields>;
  description?: Maybe<string>;
  diseaseId: string;
  levelSeverity?: Maybe<string>;
  outcome?: Maybe<string>;
  stage?: Maybe<string>;
}

export interface IndividualInfoFields {
  cadidateGene?: Maybe<string>;
  classifications?: Maybe<string>;
  diagnosis?: Maybe<string>;
}
export interface IndividualResponseFields {
  datasetId?: Maybe<string>;
  diseases?: Maybe<DiseaseFields[]>;
  ethnicity?: Maybe<string>;
  geographicOrigin?: Maybe<string>;
  individualId?: Maybe<string>;
  info?: Maybe<IndividualInfoFields>;
  phenotypicFeatures?: Maybe<PhenotypicFeaturesFields[]>;
  sex?: Maybe<string>;
}

export interface VariantQueryResponseSchema {
  variant: VariantResponseFields;
  individual: IndividualResponseFields;
  contactInfo: string;
}

export interface VariantQueryErrorResponse {
  id: string;
  code: number | string;
  message?: string | null;
}

export interface VariantQueryBaseResult {
  source: string;
}

export interface VariantQueryDataResult extends VariantQueryBaseResult {
  data: VariantQueryResponseSchema[];
}

export interface VariantQueryErrorResult extends VariantQueryBaseResult {
  error: VariantQueryErrorResponse;
}

export interface VariantQueryResponse {
  data: VariantQueryDataResult[];
  errors: VariantQueryErrorResult[];
  meta?: string;
}

export interface VariantQueryInput {
  assemblyId?: string;
  maxFrequency?: number;
}

export interface GeneQueryInput {
  geneName?: string;
  ensemblId?: string;
}

export interface QueryInput {
  input: {
    sources: string[];
    gene: GeneQueryInput;
    variant: VariantQueryInput;
  };
}

/* end graphql schema types */

export interface ResolvedVariantQueryResult {
  data: VariantQueryResponseSchema[];
  error: VariantQueryErrorResponse | null;
  source: string;
}

export interface GqlContext {
  req: Request;
  res: Response;
  pubsub: PubSub;
}

export type ResultTransformer<T> = (args: T | null) => VariantQueryResponseSchema[];

export type ErrorTransformer<T> = (args: T | null) => VariantQueryErrorResponse | null;
