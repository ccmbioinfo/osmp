import { Request, Response } from 'express';
import { Maybe } from 'graphql/jsutils/Maybe';
export interface VariantResponseInfoFields {
  af?: number;
  aaAlt?: Maybe<string>;
  aaPos?: Maybe<string>;
  aaRef?: Maybe<string>;
  cdna?: Maybe<string>;
  consequence?: Maybe<string>;
  geneName?: Maybe<string>;
  gnomadHet?: Maybe<string>;
  gnomadHom?: Maybe<string>;
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

export type AssemblyId = 'gnomAD_GRCh37' | '38' | 'GRCh37' | 'GRCh38' | '37' | 'hg19' | 'hg38' | '';

export interface VariantResponseFields {
  alt: string;
  assemblyId: AssemblyId;
  callsets: CallSet[];
  end: number;
  info?: VariantResponseInfoFields;
  ref: string;
  referenceName: string;
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

export interface VariantQueryDataResult {
  contactInfo: string;
  individual: IndividualResponseFields;
  source: string;
  variant: VariantResponseFields;
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

export interface VariantCoordinate {
  alt: string;
  chrom: string;
  ref: string;
  pos: number;
}

export interface CaddAnnotation extends VariantCoordinate {
  aaAlt: string;
  aaPos: string;
  aaRef: string;
  cdna: string;
  consequence: string;
  transcript: string;
}

export interface GnomadAnnotation extends VariantCoordinate {
  af: number;
  an: number;
  nhomalt: number;
  assembly: string;
  type: string;
}

export interface ErrorResponse {
  id: string;
  code: number | string;
  message?: string | null;
}

export interface QueryResult<T> {
  source: string;
  data: T;
  error?: ErrorResponse;
}

export type VariantQueryResponse = QueryResult<VariantQueryDataResult[]>;
export type CADDAnnotationQueryResponse = QueryResult<CaddAnnotation[]>;

export interface SourceError {
  source: string;
  error: ErrorResponse;
}

export interface CombinedVariantQueryResponse {
  data: VariantQueryDataResult[];
  errors: SourceError[];
}

export interface GqlContext {
  req: Request;
  res: Response;
}

export type ResultTransformer<T> = (args: T | null) => VariantQueryDataResult[];

export type ErrorTransformer<T> = (args: T | null) => ErrorResponse | undefined;

export enum Assembly {
  GRCh37 = 37,
  hg19 = 37,
  GRCh38 = 38,
  hg38 = 38,
}
