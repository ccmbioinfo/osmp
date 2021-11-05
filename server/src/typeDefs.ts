import { gql } from 'apollo-server-express';

export default gql`
  type VariantQueryResponse {
    data: [VariantQueryDataResult!]!
    errors: [VariantQueryErrorResult]!
  }

  type VariantResponseInfoFields {
    aaAlt: String
    aaPos: String
    aaRef: String
    assembly: String
    cdna: String
    consequence: String
    geneName: String
    gnomadHet: Int
    gnomadHom: Int
    transcript: String
  }

  type CallSetInfoFields {
    ad: Float
    dp: Int
    gq: Float
    qual: Float
    zygosity: String
  }

  type CallSet {
    callSetId: String
    datasetId: String
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
    referenceName: String
    start: Int!
    variantType: String
  }

  type AgeOfOnsetFields {
    age: Float
    ageGroup: String
  }

  type PhenotypicFeaturesFields {
    ageOfOnset: AgeOfOnsetFields
    dateOfOnset: String
    levelSeverity: String
    onsetType: String
    phenotypeId: String
  }

  type IndividualResponseFields {
    datasetId: String
    diseases: [DiseaseFields]
    ethnicity: String
    geographicOrigin: String
    individualId: String
    info: IndividualInfoFields
    phenotypicFeatures: [PhenotypicFeaturesFields]
    sex: String
  }

  type IndividualInfoFields {
    candidateGene: String
    classifications: String
    diagnosis: String
  }

  type DiseaseFields {
    ageOfOnset: AgeOfOnsetFields
    description: String
    diseaseId: String
    levelSeverity: String
    outcome: String
    stage: String
  }

  type VariantQueryDataResult {
    variant: VariantResponseFields!
    individual: IndividualResponseFields!
    contactInfo: String!
    source: String!
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
    position: String
  }

  input QueryInput {
    sources: [String!]!
    gene: GeneQueryInput
    variant: VariantQueryInput
  }

  type ResolutionMessage {
    node: String!
  }

  type Query {
    getVariants(input: QueryInput): VariantQueryResponse!
  }
`;
