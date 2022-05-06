import { promises } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { AssemblyId, VariantQueryDataResult } from '../../../types';
import resolveAssembly from '../utils/resolveAssembly';
const exec = require('util').promisify(require('child_process').exec);

const createTmpFile = async () => {
  const dir = await promises.mkdtemp(path.join(tmpdir(), 'liftover-'));
  return path.join(dir, 'temp');
};

// Get start positions of lifted variants.
const parseBedStart = (bed: String) =>
  bed
    .split('\n')
    .filter(l => !!l && !l.startsWith('#'))
    .map(v => v.split('\t')[1]);

// Get end positions of lifted variants.
const parseBedEnd = (bed: String) =>
  bed
    .split('\n')
    .filter(l => !!l && !l.startsWith('#'))
    .map(v => v.split('\t')[2]);

const liftover = async (
  dataForAnnotation: VariantQueryDataResult[],
  dataForLiftover: VariantQueryDataResult[],
  assemblyIdInput: AssemblyId
) => {
  // Convert variants from JSON format to BED format.
  // Note that position format is 1-based and BED format is half-open 0-based: https://genome.ucsc.edu/FAQ/FAQformat.html#format1
  const bedstring = dataForLiftover
    .map(v => `chr${v.variant.referenceName}\t${v.variant.start - 1}\t${v.variant.end}`)
    .join('\n');
  const lifted = await createTmpFile();
  const unlifted = await createTmpFile();
  const bedfile = await createTmpFile();
  await promises.writeFile(bedfile, bedstring);

  let chain: string;
  if (assemblyIdInput === 'GRCh37') {
    chain = '/home/node/hg38ToHg19.over.chain';
  } else {
    chain = '/home/node/hg19ToHg38.over.chain';
  }
  await exec(`liftOver ${bedfile} ${chain} ${lifted} ${unlifted}`);
  const _liftedVars = await promises.readFile(lifted);
  const _unliftedVars = await promises.readFile(unlifted);
  const liftedVars = parseBedStart(_liftedVars.toString());
  const unliftedVars = parseBedStart(_unliftedVars.toString());
  const liftedVarsEnd = parseBedEnd(_liftedVars.toString());

  const unliftedMap: { [key: string]: boolean } = unliftedVars.reduce(
    (acc, curr) => ({ ...acc, [curr]: true }),
    {}
  );
  const unliftedVariants: VariantQueryDataResult[] = [];

  // Merge lifted variants with dataForAnnotation. Filter unmapped variants.
  dataForLiftover.forEach((v, i) => {
    if (unliftedMap[(v.variant.start - 1).toString()]) {
      v.variant.assemblyId = resolveAssembly(v.variant.assemblyId);
      v.variant.assemblyIdCurrent = v.variant.assemblyId;
      unliftedVariants.push(v);
    } else {
      v.variant.start = Number(liftedVars[i]) + 1; // Convert from BED format to position format.
      v.variant.end = Number(liftedVarsEnd[i]);
      v.variant.assemblyId = resolveAssembly(v.variant.assemblyId);
      v.variant.assemblyIdCurrent = assemblyIdInput;
      dataForAnnotation.push(v);
    }
  });

  // Compute the annotation position for the variants that are in user's requested assembly.
  let geneStart = Infinity;
  let geneEnd = 0;
  dataForAnnotation.forEach(result => {
    if (result.variant.start < geneStart) {
      geneStart = result.variant.start;
    }
    if (result.variant.end > geneEnd) {
      geneEnd = result.variant.end;
    }
  });
  const annotationPosition = `${dataForAnnotation[0].variant.referenceName}:${geneStart}-${geneEnd}`;

  promises.rm(lifted);
  promises.rm(unlifted);
  promises.rm(bedfile);

  return { dataForAnnotation, unliftedVariants, annotationPosition };
};

export default liftover;
