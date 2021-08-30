import { FetchResult } from '@apollo/client';
import { Maybe } from 'graphql/jsutils/Maybe';

export interface DropdownItem {
    id: number;
    value: string;
    label: string;
}

export interface VariantQueryResponseSchemaTableRow extends VariantQueryResponseSchema {
    source: string;
}

export interface VariantQueryErrorResponse {
    id: string;
    code: number | string;
    message?: string | null;
}

export interface VariantQueryBaseResult {
    source: string;
}

export interface VariantResponseInfoFields {
    af?: Maybe<number>;
}

export interface CallsetInfoFields {
    ad?: Maybe<number>;
    dp?: Maybe<number>;
    zygosity?: Maybe<string>;
}

export interface CallSet {
    callSetId: string;
    individualId: String;
    info: CallsetInfoFields;
}

export interface VariantResponseFields {
    alt: string;
    assemblyId: Maybe<string>;
    callsets: CallSet[];
    end: number;
    info: Maybe<VariantResponseInfoFields>;
    ref: string;
    refSeqId: string;
    start: number;
}

export interface AgeOfOnsetFields {
    age: Maybe<number>;
    ageGroup: Maybe<String>;
}

export interface PhenotypicFeaturesFields {
    phenotypeId?: Maybe<string>;
    dateOfOnset?: Maybe<string>;
    onsetType?: Maybe<string>;
    ageOfOnset?: Maybe<AgeOfOnsetFields>;
    levelSeverity?: Maybe<string>;
}

export interface IndividualResponseFields {
    individualId?: Maybe<string>;
    datasetId?: Maybe<string>;
    taxonId?: Maybe<string>;
    sex?: Maybe<string>;
    ethnicity?: Maybe<string>;
    phenotypicFeatures?: Maybe<PhenotypicFeaturesFields[]>;
    contactEmail?: Maybe<string>;
}

export interface VariantQueryResponseSchema {
    variant: VariantResponseFields;
    individual: IndividualResponseFields;
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

export interface ResolvedVariantQueryResult {
    data: VariantQueryResponseSchema[];
    error: VariantQueryErrorResponse | null;
    source: string;
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

export type TableRowIndividual = IndividualResponseFields | CallsetInfoFields | { source: string };
export type TableRowVariant = Omit<VariantResponseFields, 'callsets'>;
export type TableRow = TableRowIndividual | TableRowVariant | { contact: any };
