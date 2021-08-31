import { gql } from 'apollo-server-express';

export default gql`
  type VariantQueryResponse {
    data: [VariantQueryDataResult!]!
    errors: [VariantQueryErrorResult]!
    meta: String
  }

  type VariantResponseInfoFields {
    af: Float
  }

  type CallSetInfoFields {
    ad: Float
    dp: Int
    zygosity: String
  }

  type CallSet {
    callSetId: String
    individualId: String
    info: CallSetInfoFields
  }

  type VariantResponseFields {
    alt: String!
    assemblyId: String!
    callsets: [CallSet]
    end: Int!
    info: VariantResponseInfoFields
    ref: String!
    refSeqId: String
    start: Int!
  }

  type AgeOfOnsetFields {
    age: Float
    ageGroup: String
  }

  type PhenotypicFeaturesFields {
    phenotypeId: String
    dateOfOnset: String
    onsetType: String
    ageOfOnset: AgeOfOnsetFields
    levelSeverity: String
  }

  type IndividualResponseFields {
    individualId: String
    datasetId: String
    taxonId: String
    sex: String
    ethnicity: String
    contactEmail: String
    phenotypicFeatures: [PhenotypicFeaturesFields]
  }

  type VariantQueryResponseSchema {
    variant: VariantResponseFields!
    individual: IndividualResponseFields!
  }

  type VariantQueryDataResult {
    source: String!
    data: [VariantQueryResponseSchema!]!
  }

  type VariantQueryErrorResponse {
    id: String
    code: String
    message: String
  }

  type VariantQueryErrorResult {
    source: String!
    error: VariantQueryErrorResponse
  }

  input VariantQueryInput {
    assemblyId: String
    maxFrequency: Float
  }

  input GeneQueryInput {
    geneName: String
    ensemblId: String
  }

  input QueryInput {
    sources: [String!]!
    gene: GeneQueryInput
    variant: VariantQueryInput
  }

  type ResolutionMessage {
    node: String!
  }

  type Subscription {
    queryResolved: ResolutionMessage!
  }

  type Query {
    getVariants(input: QueryInput): VariantQueryResponse!
  }
`;
