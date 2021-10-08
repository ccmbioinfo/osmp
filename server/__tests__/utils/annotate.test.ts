import annotate from '../../src/resolvers/getVariantsResolver/utils/annotate';
import { VariantQueryResponse } from '../../src/types';
import mongoose from 'mongoose';

/**
    Confirms that the variant query response is annotated before getting returned to the frontend
*/
describe('Test whether variants get annotated', () => {
  beforeAll(() => {
    mongoose.connect(process.env.MONGO_DATABASE_URL!);
  });

  afterAll(done => {
    mongoose.disconnect().then(done);
  });

  it('finds the correct coordinates and returns a unique annotation', async () => {
    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [
            {
              individual: { individualId: 'testId1' },
              variant: {
                alt: 'T',
                assemblyId: 'GRCh37',
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
    const { result, annotations } = await annotate(variants);

    expect(annotations.length).toEqual(1);

    const annotation = annotations[0];

    // Check if annotation has the proper coordinates
    expect(annotation).toHaveProperty('alt', 'T');
    expect(annotation).toHaveProperty('ref', 'A');
    expect(annotation).toHaveProperty('chr', 1);
    expect(annotation).toHaveProperty('pos', 123456);
    expect(annotation).toHaveProperty('assembly', 37);

    // Check if the corresponding variant has info fields populated
    result.data.forEach(d =>
      d.data.forEach(d => {
        expect(d.variant.info).toEqual({
          aaChanges: 'Z[AGC] > Y[TGC]',
          cDna: 'ABC',
          geneName: 'SOME_GENE_NAME',
          gnomadHet: 0,
          gnomadHom: 0,
          transcript: 'ENSTFAKE10000',
        });
      })
    );
  }, 100000);

  it('test empty variants data array', async () => {
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
    const { annotations } = await annotate(variants);

    expect(annotations.length).toEqual(0);
  });

  it('test coordinate that does not exist', async () => {
    const variants: VariantQueryResponse = {
      errors: [],
      data: [
        {
          data: [
            {
              individual: { individualId: 'testId1' },
              variant: {
                alt: 'T',
                assemblyId: 'GRCh37',
                callsets: [],
                end: 999999999999,
                info: {},
                ref: 'A',
                refSeqId: '1',
                start: 999999999999,
              },
              contactInfo: 'DrExample@gmail.com',
            },
          ],
          source: 'local',
        },
      ],
      meta: 'some test meta',
    };
    const { annotations, result } = await annotate(variants);

    expect(annotations.length).toEqual(0);
    expect(result).toEqual(variants);
  });
});
