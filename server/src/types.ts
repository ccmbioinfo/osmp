/* eslint-disable camelcase */
import { Request, Response } from 'express';
import { Maybe } from 'graphql/jsutils/Maybe';
export interface VariantResponseInfoFields {
  af?: Maybe<number>;
  aaAlt?: Maybe<string>;
  aaPos?: Maybe<string>;
  aaRef?: Maybe<string>;
  cdna?: Maybe<string>;
  consequence?: Maybe<string>;
  geneName?: Maybe<string>;
  gnomadHet?: Maybe<string>;
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
  callsetId: string;
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
  variantId?: Maybe<string>;
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
  candidateGene?: Maybe<string>;
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
  maxFrequency: number;
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

/* start OpenAPI schema types */

type OAQueryResponseResult = Omit<VariantQueryDataResult, 'source'>;

export interface OAQueryResponse {
  exists: boolean;
  numTotalResults: number;
  results: OAQueryResponseResult[];
}

/* end OpenAPI Schema types */

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

export type ResultTransformer<T> = (model: T, ...args: any[]) => VariantQueryDataResult[];

export type ErrorTransformer<T> = (model: T | null) => ErrorResponse | undefined;

export enum Assembly {
  GRCh37 = 37,
  hg19 = 37,
  GRCh38 = 38,
  hg38 = 38,
}
export interface Apgar {
  apgar1?: number;
  apgar5?: number;
}

export interface Contact {
  institution?: string;
  id?: string;
  name?: string;
  email?: string;
}

export interface DateOfBirth {
  year?: number;
  month?: number;
  day?: number;
}

export interface DateOfDeath {
  year?: number;
  range?: {
    years?: number;
  };
}
export interface Ethnicity {
  maternal_ethnicity: string[];
  paternal_ethnicity: string[];
}

export interface FamilyHistory {
  miscarriages?: Maybe<boolean>;
  consanguinity?: Maybe<boolean>;
  affectedRelatives?: Maybe<boolean>;
}

export interface Feature {
  id: string;
  label: string;
  type: string;
  observed: string;
}

export interface Gene {
  gene: string;
  strategy: string[];
  status: string;
}

export interface Link {
  rel: string;
  href: string;
  allowedMethods: string[];
}

export interface Meta {
  ordo_version?: string;
  hgnc_version?: Date;
  omim_version?: Date;
  hpo_version?: string;
  phenotips_version?: string;
}

export interface Notes {
  family_history: string;
  genetic_notes: string;
  prenatal_development: string;
  indication_for_referral: string;
  medical_history: string;
  diagnosis_notes: string;
}

export interface PatientName {
  last_name: string;
  first_name: string;
}

export interface Solved {
  status?: 'solved' | 'unsolved';
  pubmed_id?: string;
  notes?: string;
}

export interface Specificity {
  date: Date;
  score: number;
  server: string;
}

export interface ParentalNames {
  paternal_first_name: string;
  paternal_last_name: string;
  maternal_first_name: string;
  maternal_last_name: string;
}
export interface G4RDPatientQueryResult {
  date: Date;
  parental_names?: ParentalNames;
  apgar: Apgar;
  notes: Notes;
  ethnicity: Ethnicity;
  date_of_birth: DateOfBirth;
  solved: Solved;
  external_id: string;
  clinicalStatus: string; // string for now - should be affected | unaffected in prod
  features: Feature[];
  disorders: Pick<Feature, 'id' | 'label'>[];
  date_of_death: DateOfDeath;
  contact: Contact[];
  last_modification_date: Date;
  patient_name: PatientName;
  specificity: Specificity;
  nonstandard_features: any[];
  links: Link[];
  id: string;
  prenatal_perinatal_history: { [key: string]: number | null };
  family_history: FamilyHistory;
  life_status: string;
  sex: string;
  reporter: string;
  last_modified_by: string;
  report_id: string;
  meta: Meta;
  genes?: Gene[];
  'clinical-diagnosis'?: any[];
}
