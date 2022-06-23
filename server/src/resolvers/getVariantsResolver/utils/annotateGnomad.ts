import resolveAssembly from './resolveAssembly';
import resolveChromosome from './resolveChromosome';
import getCoordinates from './getCoordinates';
import { VariantQueryDataResult } from '../../../types';
import { TabixIndexedFile } from '@gmod/tabix';
import VCF from '@gmod/vcf';
import { RemoteFile, Fetcher } from 'generic-filehandle';
import fetch from 'cross-fetch';

interface Annotation {
  ALT: string[];
  CHROM: string;
  INFO: {
    AF: number[];
    AN: number[];
    nhomalt: number[];
    vep: string[];
  };
  POS: number;
  REF: string;
}

interface FormattedAnnotation {
  af: number;
  alt: string;
  amino_acids?: string;
  an: number;
  cdna?: string;
  chrom: string;
  gene?: string;
  nhomalt: number;
  pos: number;
  ref: string;
  transcript?: string;
}

type ParsedVEP = Pick<FormattedAnnotation, 'amino_acids' | 'cdna' | 'gene' | 'transcript'>;

const queryAnnotations = async (position: string, TBI_URL: string, VCF_URL: string) => {
  const { chromosome, start, end } = resolveChromosome(position);

  const nodeFetch = fetch as Fetcher;
  const tbiIndexed = new TabixIndexedFile({
    filehandle: new RemoteFile(VCF_URL, { fetch: nodeFetch }),
    tbiFilehandle: new RemoteFile(TBI_URL, { fetch: nodeFetch }),
  });

  const headerText = await tbiIndexed.getHeader();
  const tbiVCFParser = new VCF({ header: headerText });

  const lines: Annotation[] = [];
  if (chromosome && start && end) {
    await tbiIndexed.getLines(`${chromosome}`, Number(start) - 1, Number(end) + 1, line => {
      lines.push(tbiVCFParser.parseLine(line));
    });
  }

  return lines;
};

const parseVEP = (rows: string[]): ParsedVEP => {
  const CANONICAL_INDEX = 26;
  const BIOTYPE_INDEX = 7;

  let targetVEPRow: string | null = null;

  rows.forEach(row => {
    const rowVals = row.split('|');

    if (rowVals[CANONICAL_INDEX] === 'YES' && rowVals[BIOTYPE_INDEX] === 'protein_coding')
      targetVEPRow = row;
  });

  if (targetVEPRow) {
    const allVals = (targetVEPRow as string).split('|');

    return {
      amino_acids: allVals[15],
      cdna: allVals[12],
      gene: allVals[4],
      transcript: allVals[6],
    };
  } else return {};
};

const getAnnotations = async (
  assemblyId: string,
  coordinates: string[],
  position: string,
  TBI_URL: string,
  VCF_URL: string
) => {
  if (coordinates.length === 0 && !assemblyId) return [];

  const annotations = await queryAnnotations(position, TBI_URL, VCF_URL);
  const processedAnnotations = Object.values(
    annotations.reduce(
      (currAnnotations: Record<string, FormattedAnnotation>, annotation: Annotation) => {
        const {
          ALT: [ALT],
          CHROM,
          INFO: {
            AF: [AF],
            AN: [AN],
            nhomalt: [nhomalt],
            vep,
          },
          POS,
          REF,
        } = annotation;

        // Filter out annotations that have an AF > 0.02 and those that that don't belong to the given coordinates
        if (AF > 0.02 || !coordinates.includes(`${ALT}-${CHROM}-${POS}-${REF}`))
          return currAnnotations;

        // Format and flatten the annotation, only keeping unique annotations
        const key = `${ALT}-${CHROM}-${AN}-${nhomalt}-${AF}-${vep}-${POS}-${REF}`;
        currAnnotations[key] = {
          // Parse the VEP string, pulling out the amino_acids, cdna, gene, and transcript fields
          ...parseVEP(vep),
          af: AF,
          alt: ALT,
          an: AN,
          chrom: CHROM,
          nhomalt: nhomalt,
          pos: POS,
          ref: REF,
        };

        return currAnnotations;
      },
      {}
    )
  );

  return processedAnnotations;
};

export const annotate = async (
  annotations: FormattedAnnotation[],
  assemblyId: string,
  coordinates: string[],
  position: string,
  queryResponse: VariantQueryDataResult[]
) => {
  const generateAnnotationKeyMap = (annotations: FormattedAnnotation[]) =>
    Object.fromEntries(
      annotations.map(a => [`${assemblyId.replace(/\D/g, '')}-${a.chrom}-${a.pos}-${a.ref}`, a])
    );

  const annotationKeyMap = generateAnnotationKeyMap(annotations);
  let GRCh37GenomeAnnotationKeyMap = {} as { [key: string]: FormattedAnnotation };

  // For the GRCh37 assembly, the genome annotations need to be queried as well to determine the overall allele frequency
  if (assemblyId === 'GRCh37') {
    const GRCH37_GENOME_TBI_URL =
      'https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/genomes/gnomad.genomes.r2.1.1.sites.vcf.bgz.tbi';
    const GRCH37_GENOME_VCF_URL =
      'https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/genomes/gnomad.genomes.r2.1.1.sites.vcf.bgz';
    const GRCh37GenomeAnnotations = await getAnnotations(
      assemblyId,
      coordinates,
      position,
      GRCH37_GENOME_TBI_URL,
      GRCH37_GENOME_VCF_URL
    );

    GRCh37GenomeAnnotationKeyMap = generateAnnotationKeyMap(GRCh37GenomeAnnotations);
  }

  queryResponse.forEach(r => {
    const {
      variant: { assemblyId, chromosome, info, ref, start },
    } = r;
    const variantKey = `${assemblyId.replace(/\D/g, '')}-${chromosome}-${start}-${ref}`;

    if (variantKey in annotationKeyMap) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { af, alt, cdna, chrom, nhomalt, pos, ref, ...rest } = annotationKeyMap[variantKey];

      r.variant.info = {
        ...info,
        // For the GRCh37 assembly,
        // the overall allele frequency is calculated as the greater value between the exome allele frequency and the genome allele frequency
        // For the GRCh38 assembly, only genome data is available,
        // so the genome allele frequency is taken to be the overall allele frequency
        af:
          assemblyId === 'GRCh37'
            ? Math.max(GRCh37GenomeAnnotationKeyMap[variantKey]?.af ?? 0, af)
            : af,
        cdna:
          r.variant.info?.cdna && r.variant.info?.cdna !== 'NA'
            ? r.variant.info?.cdna
            : cdna
            ? `c.${cdna}${ref}>${alt}`
            : 'NA',
        gnomadHom: nhomalt,
        ...rest,
      };
    }
  });

  return queryResponse;
};

const annotateGnomad = async (
  assemblyId: string,
  position: string,
  queryResponse: VariantQueryDataResult[]
) => {
  const resolvedAssemblyId = resolveAssembly(assemblyId);
  const { chromosome } = resolveChromosome(position);

  const VCF_URL =
    resolvedAssemblyId === 'GRCh37'
      ? 'https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/exomes/gnomad.exomes.r2.1.1.sites.vcf.bgz'
      : `https://storage.googleapis.com/gcp-public-data--gnomad/release/3.1.2/vcf/genomes/gnomad.genomes.v3.1.2.sites.chr${chromosome}.vcf.bgz`;
  const TBI_URL =
    resolvedAssemblyId === 'GRCh37'
      ? 'https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/exomes/gnomad.exomes.r2.1.1.sites.vcf.bgz.tbi'
      : `https://storage.googleapis.com/gcp-public-data--gnomad/release/3.1.2/vcf/genomes/gnomad.genomes.v3.1.2.sites.chr${chromosome}.vcf.bgz.tbi`;

  const coordinates = getCoordinates(queryResponse).coordinates.map(
    ({ alt, chrom, pos, ref }) => `${alt}-${chrom}-${pos}-${ref}`
  );
  const annotations = await getAnnotations(
    resolvedAssemblyId,
    coordinates,
    position,
    TBI_URL,
    VCF_URL
  );

  return await annotate(annotations, resolvedAssemblyId, coordinates, position, queryResponse);
};

export default annotateGnomad;
