import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import resolveAssembly from './resolveAssembly';
import { v4 as uuidv4 } from 'uuid';
import { CADDAnnotationQueryResponse, CaddAnnotation } from '../../../types';
import logger from '../../../logger';

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

/* eslint-disable camelcase */
interface EnsemblRegionMap {
  seq_region_name: number; // chrom if coord_system==chromosome
  end: number;
  strand: number;
  assembly: string;
  start: number;
  coord_system: string;
}

interface PositionMapperResponse {
  mappings: {
    original: EnsemblRegionMap;
    mapped: EnsemblRegionMap;
  }[];
}

const _getAnnotations = async (position: string, assemblyId: string) => {
  const query = await _buildQuery(position, assemblyId);
  const execPromise = promisify(exec);

  let response;
  try {
    response = execPromise(query, { maxBuffer: 10e7 }); // 100mb
  } catch (err) {
    logger.error(err);
    throw err;
  }

  return response;
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

  let mappedPosition;

  /* if assembly target is 37, map to 37, since FE will return only 38 coordinates -- todo: in new flow we'll just liftover ourselves and not fetch in advance */
  if (resolvedAssemblyId !== '38') {
    const mappedPositionResponse = await axios.get<PositionMapperResponse>(
      `http://rest.ensembl.org/map/homo_sapiens/GRCh38/${position}/GRCh37`
    );
    const { seq_region_name: chrom, start, end } = mappedPositionResponse.data.mappings[0]?.mapped;
    mappedPosition = `${chrom}:${start}-${end}`;
  }

  const resolvedPosition = mappedPosition ?? position;

  const annotationUrl = resolvedAssemblyId === '38' ? ANNOTATION_URL_38 : ANNOTATION_URL_37;
  const indexPath = resolvedAssemblyId === '38' ? INDEX_38_PATH : INDEX_37_PATH;

  return `tabix -h  ${annotationUrl} ${indexPath} ${resolvedPosition} | awk 'NR!=1{print $1,$2,$3,$4,$8,$17,$18,$20,$25,$29}'`;
};

const fetchAnnotations = (
  position: string,
  assemblyId: string
): Promise<CADDAnnotationQueryResponse> => {
  const source = 'CADD annotations';
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
};

export default fetchAnnotations;
