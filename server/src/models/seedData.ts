import Faker from 'faker';
import logger from '../logger';
import models from './index';

const createDummyVariantAnnotations = async () => {
  const variants = Array(5000)
    .fill(null)
    .map(() => {
      const bases = ['A', 'T', 'C', 'G'];
      const ref = Faker.helpers.randomize(bases);
      const alt = Faker.helpers.randomize(bases.filter(b => b !== ref));
      const chr = Faker.helpers.randomize(['X', 'Y', ...[...Array(22).keys()].map(x => x + 1)]);
      const assembly = Faker.helpers.randomize([37, 38]);
      const aaChanges = `Z[${ref}GC] > Y[${alt}GC]`;
      const cdna = Array(100)
        .fill(null)
        .map(() => Faker.helpers.randomize(bases))
        .join('');
      const geneName = 'SOME_GENE_NAME';
      const gnomadHet = Faker.datatype.float({ min: 0, max: 1, precision: 5 });
      const gnomadHom = Faker.helpers.randomize([0, 0, 0, 0, 0, 1, 2]);
      const transcript = `ENSTFAKE${Faker.datatype.number({ min: 10000, max: 20000 })}`;
      return {
        alt: alt,
        ref: ref,
        chr: chr,
        assembly: assembly,
        aa_changes: aaChanges,
        cdna: cdna,
        gene_name: geneName,
        gnomad_het: gnomadHet,
        gnomad_hom: gnomadHom,
        transcript: transcript,
      };
    });
  try {
    await models.VariantAnnotation.create(variants);
  } catch (err) {
    logger.error(err);
  }
};

export default createDummyVariantAnnotations;
