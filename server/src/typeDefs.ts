import { gql } from 'apollo-server-express';

export default gql`
  type VariantQueryResponse {
    data: [VariantQueryDataResult!]!
    errors: [VariantQueryErrorResult]!
  }

  type VariantResponseInfoFields {
    af: Float
    aaAlt: String
    aaPos: String
    aaRef: String
    assembly: String
    cdna: String
    consequence: String
    geneName: String
    gnomadHet: Int
    gnomadHom: Int
    phred: Float
    spliceAIScore: Float
    spliceAIType: String
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
    callsetId: String
    individualId: String
    info: CallSetInfoFields
  }

  type VariantResponseFields {
    alt: String!
    assemblyId: String!
    assemblyIdCurrent: String!
    callsets: [CallSet]
    end: Int!
    info: VariantResponseInfoFields
    ref: String!
    chromosome: String
    start: Int!
    variantId: String
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
    phenotypeLabel: String
  }

  type Disorder {
    id: String
    label: String
  }

  type IndividualResponseFields {
    diseases: [DiseaseFields]
    ethnicity: String
    familyId: String
    geographicOrigin: String
    individualId: String
    info: IndividualInfoFields
    phenotypicFeatures: [PhenotypicFeaturesFields]
    sex: String
  }

  type IndividualInfoFields {
    candidateGene: String
    clinicalStatus: String
    disorders: [Disorder!]
    solved: String
    classifications: String
    diagnosis: String
  }

  type DiseaseFields {
    ageOfOnset: AgeOfOnsetFields
    description: String
    diseaseId: String
    diseaseLabel: String
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
    assemblyId: String!
    maxFrequency: Float!
  }

  input GeneQueryInput {
    geneName: String!
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
