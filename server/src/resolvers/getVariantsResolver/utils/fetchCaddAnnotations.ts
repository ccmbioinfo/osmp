import resolveAssembly from './resolveAssembly';
import resolveChromosome from './resolveChromosome';
import { v4 as uuidv4 } from 'uuid';
import { CADDAnnotationQueryResponse, CaddAnnotation } from '../../../types';
import { TabixIndexedFile } from '@gmod/tabix';
import { RemoteFile, Fetcher } from 'generic-filehandle';
import fetch from 'cross-fetch';

const ANNOTATION_URL_38 =
  'https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh38/whole_genome_SNVs_inclAnno.tsv.gz';
const ANNOTATION_URL_37 =
  'https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh37/whole_genome_SNVs_inclAnno.tsv.gz';

const INDEX_37_PATH =
  'https://minio.genomics4rd.ca/www-ssmp-dev/whole_genome_SNVs_inclAnno_GRCh37.tsv.gz.csi';
const INDEX_38_PATH =
  'https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh38/whole_genome_SNVs_inclAnno.tsv.gz.tbi';

/**
 * The function queries CADD annotation TSV and returns a list of string, each of which represents one line in the TSV.
 * @param position: the variant coordinates. Has the format [chromosome]:[start]-[end] (e.g. 19:12345-67890)
 * @param assemblyId: version of the human reference genome. Can be "hg38", "hg19", "GRCh38", or "GRCh37".
 * @returns a list of strings, each of which contains information for one variant annotation.
 */

const _getAnnotations = async (position: string, assemblyId: string) => {
  const annotationUrl = assemblyId === 'GRCh38' ? ANNOTATION_URL_38 : ANNOTATION_URL_37;
  const indexPath = assemblyId === 'GRCh38' ? INDEX_38_PATH : INDEX_37_PATH;

  const nodeFetch = fetch as Fetcher;
  let tbiIndexed: TabixIndexedFile;
  if (assemblyId === 'GRCh37') {
    tbiIndexed = new TabixIndexedFile({
      filehandle: new RemoteFile(annotationUrl, { fetch: nodeFetch }),
      csiFilehandle: new RemoteFile(indexPath, { fetch: nodeFetch }),
    });
  } else {
    tbiIndexed = new TabixIndexedFile({
      filehandle: new RemoteFile(annotationUrl, { fetch: nodeFetch }),
      tbiFilehandle: new RemoteFile(indexPath, { fetch: nodeFetch }),
    });
  }

  const { chromosome, start, end } = resolveChromosome(position);

  const lines: string[] = [];
  if (chromosome && start && end) {
    // Note that tabix library uses half-open 0-based (https://www.biostars.org/p/84686/), while the index we get from position is 1-based.
    await tbiIndexed.getLines(`${chromosome}`, Number(start) - 1, Number(end) + 1, line => {
      lines.push(line);
    });
  }

  return lines;
};

/**
 * Takes in tabix query response and adapts it to @typedef CaddAnnotation
 * @param annotations: a list of tab-delimited strings from CADD annotation TSV.
 * Indexes for headers in the annotation TSV can be found at https://cadd.gs.washington.edu/static/ReleaseNotes_CADD_v1.6.pdf.
 *  Chrom: 1
    Pos: 2
    Ref: 3
    Alt: 4
    Consequence: 8
    oAA: 17
    nAA: 18
    FeatureID: 20
    cDNApos: 25
    protpos: 29
    spliceAI-acc-gain: 94 (GRCh37) 109 (GRCh38)
    spliceAI-acc-loss: 95 (GRCh37) 110 (GRCh38)
    spliceAI-don-gain: 96 (GRCh37) 111 (GRCh38)
    spliceAI-don-loss: 97 (GRCh37) 112 (GRCh38)
    PHRED: 116 (GRCh37) 134 (GRCh38)
  *
 * @returns an array of JSON of @typedef CaddAnnotation
 * Report the maximum of the four spliceAI scores and the corresponding score type. If the maximum is 0 or NA, report 0.
 */

const _formatAnnotations = (annotations: string[], assemblyId: string) => {
  let phredIndex = 115;
  let spliceAIIndex = 93;
  if (assemblyId === 'GRCh38') {
    phredIndex = 133;
    spliceAIIndex = 108;
  }
  const HEADERS_INDEX_MAP: Array<[keyof CaddAnnotation, number]> = [
    ['chrom', 0],
    ['pos', 1],
    ['ref', 2],
    ['alt', 3],
    ['consequence', 7],
    ['aaRef', 16],
    ['aaAlt', 17],
    ['transcript', 19],
    ['cdna', 24],
    ['aaPos', 28],
    ['phred', phredIndex],
  ];

  const spliceAIOrder = [
    'SpliceAI-acc-gain',
    'SpliceAI-acc-loss',
    'SpliceAI-don-gain',
    'SpliceAI-don-loss',
  ];

  const result = annotations.map(a => {
    const columns = a.split('\t');
    // filter spliceAI score:
    const spliceAIScores = [
      parseFloat(columns[spliceAIIndex]),
      parseFloat(columns[spliceAIIndex + 1]),
      parseFloat(columns[spliceAIIndex + 2]),
      parseFloat(columns[spliceAIIndex + 3]),
    ];
    let spliceAIMaxScore = Math.max(...spliceAIScores);
    let spliceAIType;
    if (spliceAIMaxScore > 0) {
      const index = spliceAIScores.indexOf(spliceAIMaxScore);
      spliceAIType = spliceAIOrder[index];
    } else {
      spliceAIMaxScore = 0;
      spliceAIType = 'NA';
    }
    return { ...Object.fromEntries(HEADERS_INDEX_MAP.map(([key, index]) => [key, columns[index]])), ...{
      spliceAIScore: spliceAIMaxScore,
      spliceAIType: spliceAIType,
    } } as unknown as CaddAnnotation;
  });
  console.log(result[0]);
  return result;
};

const fetchAnnotations = (
  position: string,
  assemblyId: string
): Promise<CADDAnnotationQueryResponse> => {
  const resolvedAssemblyId = resolveAssembly(assemblyId);
  const source = 'CADD annotations';
  const [start, end] = position.replace(/.+:/, '').split('-');
  const size = +end - +start;
  if (size > 600000) {
    return Promise.resolve({
      error: {
        id: uuidv4(),
        code: 422,
        message: `Gene of size ${size.toLocaleString()}bp is too large to annotate with VEP. Annotating with gnomAD only!`,
      },
      source,
      data: [],
    });
  } else {
    return _getAnnotations(position, resolvedAssemblyId)
      .then(result => ({ source, data: _formatAnnotations(result, resolvedAssemblyId) }))
      .catch(error => ({
        error: {
          id: uuidv4(),
          code: 500,
          message: `Error fetching annotations: ${error}`,
        },
        source,
        data: [],
      }));
  }
};

export default fetchAnnotations;
