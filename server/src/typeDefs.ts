import { gql } from 'apollo-server-express';

export default gql`
  type VariantQueryResponse {
    data: [VariantQueryDataResult]!
    errors: [VariantQueryErrorResult]!
    meta: String
  }

  type VariantQueryResponseSchema {
    af: Float
    alt: String
    chromosome: String
    dp: Int
    ref: String
    rsID: Int
  }

  type VariantQueryDataResult {
    source: String!
    data: [VariantQueryResponseSchema]!
  }

  type VariantQueryErrorResponse {
    code: Int!
    message: String
  }

  type VariantQueryErrorResult {
    source: String!
    error: VariantQueryErrorResponse
  }

  input VariantQueryInput {
    chromosome: String!
    start: Int!
    end: Int!
    sources: [String!]!
  }

  type ResolutionMessage {
    node: String!
  }

  type Subscription {
    queryResolved: ResolutionMessage!
  }

  type Query {
    getVariants(input: VariantQueryInput): VariantQueryResponse
  }
`;
