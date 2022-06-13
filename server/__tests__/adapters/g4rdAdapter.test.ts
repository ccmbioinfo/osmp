import { makeExecutableSchema } from '@graphql-tools/schema';
import { G4RDVariantQueryResult, transformG4RDQueryResponse } from '../../src/resolvers/getVariantsResolver/adapters/g4rdAdapter';
import typeDefs from '../../src/typeDefs';
import { CombinedVariantQueryResponse } from '../../src/types';
import { addMocksToSchema } from '@graphql-tools/mock';
import { testGraphQLQuery } from '../testGraphQLQuery';

/* an around the world test here would validate the transformer and pass it to the schema */

const testResponse: G4RDVariantQueryResult = {
  exists: true,
  numTotalResults: 1,
  results: [
    {
      variant: {
        variantId: 'rs201202918',
        assemblyId: 'GRCh37',
        chromosome: 'NM_001304829.2',
        start: 100573569,
        end: 100573569,
        ref: 'G',
        alt: 'A',
        callsets: [
          {
            callsetId: '12345.sample-singleton-report.csv',
            individualId: '12345',
            info: { ad: 4, dp: 13, qual: 62.8, zygosity: 'heterozygous' },
          },
        ],
        info: {
          geneName: 'SASS6',
          aaChanges: 'NA',
          transcript: 'ENST00000287482',
          gnomadHom: 0,
          cdna: 'c.361-9C>T',
        },
      },
      individual: {
        individualId: '12345',
        diseases: [],
        phenotypicFeatures: [
          { phenotypeId: 'HP:0002140', levelSeverity: null },
          { phenotypeId: 'HP:0002326', levelSeverity: null },
          { phenotypeId: 'HP:0012158', levelSeverity: null },
        ],
        sex: 'NCIT:C46112',
      },
      contactInfo: 'Test User',
    },
  ],
};

const patientTestResponse =  [
  {
    date: new Date('2021-12-14T19:40:50.000Z'),
    parental_names: {
      paternal_first_name: '',
      maternal_first_name: '',
      paternal_last_name: '',
      maternal_last_name: '',
    },
    apgar: {},
    notes: {
      family_history: '',
      prenatal_development: '',
      indication_for_referral: '',
      genetic_notes: '',
      medical_history: '',
      diagnosis_notes: 'Hello World',
    },
    ethnicity: {
      maternal_ethnicity: [],
      paternal_ethnicity: [],
    },
    date_of_birth: {
      month: 9,
      year: 2006,
    },
    solved: {
      status: 'unsolved',
    },
    external_id: '2199_SK0445',
    clinicalStatus: 'unaffected',
    disorders: [],
    features: [
      {
        id: 'HP:0002140',
        label: 'Ischemic stroke',
        type: 'phenotype',
        observed: 'yes',
      },
      {
        id: 'HP:0002326',
        label: 'Transient ischemic attack',
        type: 'phenotype',
        observed: 'yes',
      },
    ],
    date_of_death: {},
    contact: [
      {
        name: 'Test User',
        id: 'xwiki:XWiki.TestUser',
      },
    ],
    last_modification_date: new Date('2021-12-14T19:40:50.000Z'),
    patient_name: {
      last_name: '',
      first_name: '',
    },
    specificity: {
      date: new Date('2021-12-14T20:40:42.341Z'),
      score: 0.8141616753657305,
      server: 'local-omim',
    },
    nonstandard_features: [],
    id: '12345',
    prenatal_perinatal_history: {
      gestation: null,
    },
    family_history: {
      consanguinity: null,
      affectedRelatives: null,
    },
    genes: [
      {
        gene: 'Hello World',
        strategy: [''],
        status: '',
      },
    ],
    life_status: 'alive',
    sex: 'M',
    'clinical-diagnosis': [],
    reporter: 'TestUser',
    last_modified_by: 'TestUser',
    report_id: 'P0000002',
    meta: {
      hgnc_version: new Date('2020-09-16T16:21:14.971Z'),
      omim_version: new Date('2018-10-03T17:01:45.970Z'),
      ordo_version: '3.0',
      hpo_version: 'hp/releases/2020-08-11',
      phenotips_version: '7.7.0-variant-store-poc-rc2',
    },
  },
];

const transformed = transformG4RDQueryResponse(testResponse, patientTestResponse, '1:1234');

/**
 * Confirm that variant query schema performs and validates as expected
 */
describe('Test g4rd query response transformer', () => {
  const GetVariants = `
    query GetVariants($input: QueryInput) {
      getVariants(input: $input) {
        data {
          variant {
            alt
            assemblyId
            callsets {
              callsetId
              individualId
              info {
                ad
                dp
                qual
                zygosity
              }
            }
            end
            info {
              cdna
              geneName
              gnomadHom
              transcript
            }
            ref
            referenceName
            start
            variantId
          }
          individual {
            diseases {
              ageOfOnset {
                age
                ageGroup
              }
              description
              diseaseId
              levelSeverity
              outcome
              stage
            }
            individualId
            phenotypicFeatures {
              levelSeverity
              phenotypeId
            }
            sex
            ethnicity
            info {
              candidateGene
              clinicalStatus
              disorders {
                id
                label
              }
              solved
              diagnosis
              classifications
            }
          }
          contactInfo
          source
        }
        errors {
          error {
            id
            code
            message
          }
          source
        }
      }
    }
  `;

  it('issues a valid query', async () => {
    const schema = makeExecutableSchema({ typeDefs });
    const mockResponse: CombinedVariantQueryResponse = {
      data: transformed,
      errors: [],
    };

    const mocks = {
      VariantQueryResponse: () => mockResponse,
    };

    const schemaWithMocks = addMocksToSchema({
      schema,
      mocks,
    });

    const queryResponse = await testGraphQLQuery({
      schema: schemaWithMocks,
      source: GetVariants,
      variableValues: {
        input: {
          variant: { assemblyId: 'foo', maxFrequency: 0.05 },
          gene: { geneName: 'bar' },
          sources: ['test'],
        },
      },
    });

    if (queryResponse.errors?.length) {
      throw queryResponse.errors;
    }

    const result = queryResponse.data ? queryResponse.data.getVariants : null;

    expect(result).toEqual(mockResponse);
  });
});
