import { connect, clearDatabase, closeDatabase } from './db';
import { VariantAnnotation as VariantAnnotationModel } from '../../src/models';
import { VariantAnnotation } from '../../src/models/VariantAnnotationModel';
import { VariantQueryResponse } from '../../src/types';

beforeAll(async () => await connect());

/*
  For each test, all the data would be cleared from the database. 
  Relevant new data needs to be added per unit test. 
*/
afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('Test database methods', () => {
  it('gets a unique annotation', async () => {
    const data = [
      {
        alt: 'T',
        ref: 'A',
        chrom: '1',
        pos: 123456,
        assembly: 'gnomAD_GRCh37',
        aaChanges: 'Z[AGC] > Y[TGC]',
        cdna: 'ABC',
        geneName: 'SOME_GENE_NAME',
        gnomadHet: 0,
        gnomadHom: 0,
        transcript: 'ENSTFAKE10000',
      },
      {
        alt: 'C',
        ref: 'A',
        chrom: '3',
        pos: 123456,
        assembly: 'gnomAD_GRCh38',
        aaChanges: 'Z[AGC] > Y[TGC]',
        cdna: 'ABC',
        geneName: 'SOME_GENE_NAME',
        gnomadHet: 0,
        gnomadHom: 0,
        transcript: 'ENSTFAKE10000',
      },
      {
        alt: 'T',
        ref: 'A',
        chrom: '2',
        pos: 999999,
        assembly: 'gnomAD_GRCh37',
        aaChanges: 'Z[AGC] > Y[TGC]',
        cdna: 'ABC',
        geneName: 'SOME_GENE_NAME',
        gnomadHet: 0,
        gnomadHom: 0,
        transcript: 'ENSTFAKE10000',
      },
    ];

    await VariantAnnotationModel.create(data);

    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [
            {
              individual: { individualId: 'testId1' },
              variant: {
                alt: 'T',
                assemblyId: 'gnomAD_GRCh37',
                callsets: [],
                end: 123456,
                info: {},
                ref: 'A',
                refSeqId: '1',
                start: 123456,
              },
              contactInfo: 'DrExample@gmail.com',
            },
          ],
          source: 'local',
        },
      ],
      meta: 'some test meta',
    };

    const annotations = await VariantAnnotationModel.getAnnotations(variants);

    expect(annotations.length).toEqual(1);
    expect(annotations[0]).toMatchObject({
      alt: 'T',
      ref: 'A',
      chrom: '1',
      pos: 123456,
      assembly: 'gnomAD_GRCh37',
      aaChanges: 'Z[AGC] > Y[TGC]',
      cdna: 'ABC',
      geneName: 'SOME_GENE_NAME',
      gnomadHet: 0,
      gnomadHom: 0,
      transcript: 'ENSTFAKE10000',
    });
  });

  it('handles empty coordinates', async () => {
    const data = [
      {
        alt: 'T',
        ref: 'A',
        chrom: '1',
        pos: 123456,
        assembly: 'gnomAD_GRCh37',
        aaChanges: 'Z[AGC] > Y[TGC]',
        cdna: 'ABC',
        geneName: 'SOME_GENE_NAME',
        gnomadHet: 0,
        gnomadHom: 0,
        transcript: 'ENSTFAKE10000',
      },
    ];

    await VariantAnnotationModel.create(data);

    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [],
          source: 'local',
        },
      ],
      meta: 'some test meta',
    };
    const annotations = await VariantAnnotationModel.getAnnotations(variants);
    expect(annotations.length).toEqual(0);
  });

  it('searches for an annotation that does not exist', async () => {
    const data: VariantAnnotation[] = [];

    await VariantAnnotationModel.create(data);

    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [
            {
              individual: { individualId: 'testId1' },
              variant: {
                alt: 'T',
                assemblyId: 'gnomAD_GRCh37',
                callsets: [],
                end: 1234567890,
                info: {},
                ref: 'A',
                refSeqId: '1',
                start: 1234567890,
              },
              contactInfo: 'DrExample@gmail.com',
            },
          ],
          source: 'local',
        },
      ],
      meta: 'some test meta',
    };

    const annotations = await VariantAnnotationModel.getAnnotations(variants);

    expect(annotations.length).toEqual(0);
  });
});
