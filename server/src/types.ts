import { Request, Response } from 'express';
import { PubSub } from 'graphql-subscriptions';
import { Maybe } from 'graphql/jsutils/Maybe';

/* these will be returned by our annotation source */

export interface VariantResponseInfoFields {
  aaAlt?: Maybe<string>;
  aaPos?: Maybe<string>;
  aaRef?: Maybe<string>;
  assembly?: Maybe<string>;
  cdna?: Maybe<string>;
  consequence?: Maybe<string>;
  geneName?: Maybe<string>;
  gnomadHet?: Maybe<string>;
  gnomadHom?: Maybe<string>;
  transcript?: Maybe<string>;
}

// these *might* be in the response)
export interface VariantAnnotation extends VariantResponseInfoFields {
  ref: string;
  pos: number;
  chrom: string;
  alt: string;
}

export type VariantAnnotationId = Pick<VariantAnnotation, 'alt' | 'chrom' | 'ref' | 'pos'>;
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

export type AssemblyId = 'gnomAD_GRCh37' | '38' | 'GRCh37' | 'GRCh38' | '37' | 'hg19' | 'hg38' | '';

export interface VariantResponseFields {
  alt: string;
  assemblyId: AssemblyId;
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
  assemblyId: AssemblyId;
  maxFrequency?: number;
}

export interface GeneQueryInput {
  geneName: string;
  ensemblId: string;
  position: string;
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

export enum Assembly {
  GRCh37 = 37,
  hg19 = 37,
  GRCh38 = 38,
  hg38 = 38,
}
