import { Maybe } from 'graphql/jsutils/Maybe';

export interface DropdownItem {
    id: number;
    value: string;
    label: string;
}

export interface VariantQueryResponseSchema {
    af: Maybe<number>;
    alt: string;
    chromosome: string;
    dp: Maybe<number>;
    ref: string;
    rsId: Maybe<string>;
}

export interface VariantQueryResponseSchemaTableRow extends VariantQueryResponseSchema {
    source: string;
}

export interface VariantQueryErrorResponse {
    code: number;
    message: string;
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
    input: {
        chromosome: string;
        start: number;
        end: number;
        sources: string[];
    };
}
