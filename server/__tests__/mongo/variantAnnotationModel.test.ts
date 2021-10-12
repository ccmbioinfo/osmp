import { connect, clearDatabase, closeDatabase } from './db';
import { VariantAnnotation as VariantAnnotationModel } from '../../src/models';
import { VariantAnnotationId } from '../../src/models/VariantAnnotationModel';

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('Test database methods', () => {
  it('gets a unique annotation', async () => {
    const coordinates = [{
      alt: 'T',
      ref: 'A',
      chr: 1,
      pos: 123456,
      assembly: 37,
    }]
    const annotations = await VariantAnnotationModel.getAnnotations(coordinates, 0, 5000000);

    expect(annotations.length).toEqual(1);
    expect(annotations[0]).toMatchObject({
      alt: 'T',
      ref: 'A',
      chr: 1,
      pos: 123456,
      assembly: 37,
      aaChanges: 'Z[AGC] > Y[TGC]',
      cdna: 'ABC',
      geneName: 'SOME_GENE_NAME',
      gnomadHet: 0,
      gnomadHom: 0,
      transcript: 'ENSTFAKE10000',
    })
  })

  it('handles empty coordinates', async () => {
    const coordinates: VariantAnnotationId[] = [];
    const annotations = await VariantAnnotationModel.getAnnotations(coordinates, 0, 5000000);

    expect(annotations.length).toEqual(0);
  })
})
