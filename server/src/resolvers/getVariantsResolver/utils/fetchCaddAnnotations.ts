import { exec } from 'child_process';
import { promisify } from 'util';
import resolveAssembly from './resolveAssembly';
import { v4 as uuidv4 } from 'uuid';
import { CADDAnnotationQueryResponse, CaddAnnotation } from '../../../types';

const ANNOTATION_URL_38 =
  'https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh38/whole_genome_SNVs_inclAnno.tsv.gz';
const ANNOTATION_URL_37 =
  'https://krishna.gs.washington.edu/download/CADD/v1.4/GRCh37/whole_genome_SNVs_inclAnno.tsv.gz';

const INDEX_37_PATH = '/home/node/cadd_wgs_ghr37_index.gz.tbi';
const INDEX_38_PATH = '/home/node/cadd_wgs_ghr38_index.gz.tbi';

/*
  indexes for headers in annotation tsv: 
  https://cadd.gs.washington.edu/static/ReleaseNotes_CADD_v1.6.pdf
  Chrom: 1
  Pos: 2
  Ref: 3
  Alt: 4
  Consequence: 8
  oAA: 17
  nAA: 18
  FeatureID: 20
  cDNApos: 25
  protpos: 29
*/

const NAME_MAP: Record<string, keyof CaddAnnotation> = {
  Chr: 'chrom',
  Pos: 'pos',
  Ref: 'ref',
  Alt: 'alt',
  Consequence: 'consequence',
  oAA: 'aaRef',
  nAA: 'aaAlt',
  FeatureID: 'transcript',
  cDNApos: 'cdna',
  protPos: 'aaPos',
};

const _getAnnotations = async (position: string, assemblyId: string) => {
  const query = await _buildQuery(position, assemblyId);
  const execPromise = promisify(exec);
  return execPromise(query, { maxBuffer: 10e7 }); // 100mb
};

const _formatAnnotations = (annotations: string) => {
  const annotationsArray = annotations.split('\n');
  const headerRow = annotationsArray.shift();

  if (!headerRow) {
    return [];
  }

  const headers = headerRow
    .split(/\W+/)
    .filter(Boolean)
    .reduce<Record<number, keyof CaddAnnotation>>(
      (acc, curr, i) => ({
        ...acc,
        [i]: NAME_MAP[curr],
      }),
      {}
    );

  return annotationsArray.map(annotation =>
    annotation
      .split(/\W+/)
      .reduce<CaddAnnotation>(
        (acc, curr, i) => ({ ...acc, [headers[i]]: curr }),
        {} as CaddAnnotation
      )
  );
};

const _buildQuery = async (position: string, assemblyId: string) => {
  const resolvedAssemblyId = resolveAssembly(assemblyId);
  const annotationUrl = resolvedAssemblyId === '38' ? ANNOTATION_URL_38 : ANNOTATION_URL_37;
  const indexPath = resolvedAssemblyId === '38' ? INDEX_38_PATH : INDEX_37_PATH;

  return `tabix -h  ${annotationUrl} ${indexPath} ${position} | awk 'NR!=1{print $1,$2,$3,$4,$8,$17,$18,$20,$25,$29}'`;
};

const fetchAnnotations = (
  position: string,
  assemblyId: string
): Promise<CADDAnnotationQueryResponse> => {
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
    return _getAnnotations(position, assemblyId)
      .then(result => ({ source, data: _formatAnnotations(result?.stdout || '') }))
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
