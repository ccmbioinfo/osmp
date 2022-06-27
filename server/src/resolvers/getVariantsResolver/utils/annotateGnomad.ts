import resolveAssembly from './resolveAssembly';
import resolveChromosome from './resolveChromosome';
import getCoordinates from './getCoordinates';
import { GnomadAnnotation, VariantQueryDataResult } from '../../../types';
import { TabixIndexedFile } from '@gmod/tabix';
import VCF from '@gmod/vcf';
import { RemoteFile, Fetcher } from 'generic-filehandle';
import fetch from 'cross-fetch';

interface GnomadVariant {
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

type ParsedVEP = Pick<GnomadAnnotation, 'amino_acids' | 'cdna' | 'gene' | 'transcript'>;

interface GnomadFiles {
  assemblyId: string;
  tbiUrl: string;
  vcfUrl: string;
}

const queryAnnotations = async (position: string, { assemblyId, tbiUrl, vcfUrl }: GnomadFiles) => {
  const { chromosome, start, end } = resolveChromosome(position);

  const nodeFetch = fetch as Fetcher;
  const tbiIndexed = new TabixIndexedFile({
    filehandle: new RemoteFile(vcfUrl, { fetch: nodeFetch }),
    tbiFilehandle: new RemoteFile(tbiUrl, { fetch: nodeFetch }),
  });

  const headerText = await tbiIndexed.getHeader();
  const tbiVCFParser = new VCF({ header: headerText });
  const lines: GnomadVariant[] = [];

  if (chromosome && start && end) {
    const refName = assemblyId === 'GRCh37' ? `${chromosome}` : `chr${chromosome}`;

    await tbiIndexed.getLines(refName, Number(start) - 1, Number(end) + 1, line => {
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
  coordinates: string[],
  position: string,
  gnomadFiles: GnomadFiles
) => {
  if (!coordinates.length) return [];

  const annotations = await queryAnnotations(position, gnomadFiles);
  const processedAnnotations = Object.values(
    annotations.reduce(
      (
        currAnnotations: Record<string, GnomadAnnotation>,
        {
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
        }: GnomadVariant
      ) => {
        const resolvedCHROM = CHROM.replace('chr', '');

        // Filter out annotations that have an AF > 0.02 and those that that don't belong to the given coordinates
        if (AF > 0.02 || !coordinates.includes(`${ALT}-${resolvedCHROM}-${POS}-${REF}`))
          return currAnnotations;

        // Format and flatten the annotation, only keeping unique annotations
        const key = `${AF}-${ALT}-${AN}-${CHROM}-${nhomalt}-${POS}-${REF}-${vep}`;
        currAnnotations[key] = {
          // Parse the VEP string, pulling out the amino_acids, cdna, gene, and transcript values
          ...parseVEP(vep),
          af: AF,
          alt: ALT,
          an: AN,
          chrom: resolvedCHROM,
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
  annotations: {
    primaryAnnotations: GnomadAnnotation[];
    secondaryAnnotations: GnomadAnnotation[];
  },
  assemblyId: string,
  queryResponse: VariantQueryDataResult[]
) => {
  const { primaryAnnotations, secondaryAnnotations } = annotations;
  const generateAnnotationKeyMap = (annotations: GnomadAnnotation[]) =>
    Object.fromEntries(
      annotations.map(a => [`${assemblyId.replace(/\D/g, '')}-${a.chrom}-${a.pos}-${a.ref}`, a])
    );

  // GRCh37 - exome annotations, GRCh38 - genome annotations
  const primaryAnnotationKeyMap = generateAnnotationKeyMap(primaryAnnotations);
  // GRCh37 - genome annotations, GRCh38 - N/A
  const secondaryAnnotationKeyMap = generateAnnotationKeyMap(secondaryAnnotations);

  queryResponse.forEach(r => {
    const {
      variant: { assemblyId, assemblyIdCurrent, chromosome, info, ref, start },
    } = r;
    const resolvedAssemblyId = assemblyIdCurrent || assemblyId;
    const variantKey = `${resolvedAssemblyId.replace(/\D/g, '')}-${chromosome}-${start}-${ref}`;

    if (variantKey in primaryAnnotationKeyMap) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { af, alt, cdna, chrom, nhomalt, pos, ref, ...rest } =
        primaryAnnotationKeyMap[variantKey];

      r.variant.info = {
        ...info,
        // For the GRCh37 assembly,
        // the overall allele frequency is calculated as the greater value between the exome allele frequency and the genome allele frequency
        // For the GRCh38 assembly, only genome data is available,
        // so the overall allele frequency is simply the genome allele frequency
        af:
          resolvedAssemblyId === 'GRCh37'
            ? Math.max(secondaryAnnotationKeyMap[variantKey]?.af ?? 0, af)
            : af,
        // Ideally, the cdna value should come from the CADD annotations (if available),
        // but it can also be determined using the values from gnomAD as a fallback
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
  const coordinates = getCoordinates(queryResponse).coordinates.map(
    ({ alt, chrom, pos, ref }) => `${alt}-${chrom}-${pos}-${ref}`
  );

  const PRIMARY_VCF_URL =
    resolvedAssemblyId === 'GRCh37'
      ? `https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/exomes/gnomad.exomes.r2.1.1.sites.${chromosome}.vcf.bgz`
      : `https://storage.googleapis.com/gcp-public-data--gnomad/release/3.1.2/vcf/genomes/gnomad.genomes.v3.1.2.sites.chr${chromosome}.vcf.bgz`;
  const PRIMARY_TBI_URL =
    resolvedAssemblyId === 'GRCh37'
      ? `https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/exomes/gnomad.exomes.r2.1.1.sites.${chromosome}.vcf.bgz.tbi`
      : `https://storage.googleapis.com/gcp-public-data--gnomad/release/3.1.2/vcf/genomes/gnomad.genomes.v3.1.2.sites.chr${chromosome}.vcf.bgz.tbi`;

  const primaryAnnotations = await getAnnotations(coordinates, position, {
    assemblyId,
    tbiUrl: PRIMARY_TBI_URL,
    vcfUrl: PRIMARY_VCF_URL,
  });

  console.log(
    `${primaryAnnotations.length} gnomAD ${resolvedAssemblyId} ${
      resolvedAssemblyId === 'GRCh37' ? 'exome' : 'genome'
    } annotation${primaryAnnotations.length === 1 ? '' : 's'} found!`
  );

  let secondaryAnnotations: GnomadAnnotation[] = [];

  // For the GRCh37 assembly, the genome annotations need to be queried as well to determine the overall allele frequency
  if (resolvedAssemblyId === 'GRCh37') {
    const GRCH37_GENOME_TBI_URL = `https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/genomes/gnomad.genomes.r2.1.1.sites.${chromosome}.vcf.bgz.tbi`;
    const GRCH37_GENOME_VCF_URL = `https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/vcf/genomes/gnomad.genomes.r2.1.1.sites.${chromosome}.vcf.bgz`;

    secondaryAnnotations = await getAnnotations(coordinates, position, {
      assemblyId,
      tbiUrl: GRCH37_GENOME_TBI_URL,
      vcfUrl: GRCH37_GENOME_VCF_URL,
    });

    console.log(
      `${primaryAnnotations.length} gnomAD GRCh37 genome annotation${
        primaryAnnotations.length === 1 ? '' : 's'
      } found!`
    );
  }

  const annotations = { primaryAnnotations, secondaryAnnotations };
  const annotatedQueryResponse = await annotate(annotations, assemblyId, queryResponse);

  return annotatedQueryResponse;
};

export default annotateGnomad;
