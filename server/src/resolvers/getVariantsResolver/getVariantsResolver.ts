import logger from '../../logger';
import {
  CADDAnnotationQueryResponse,
  CombinedVariantQueryResponse,
  QueryInput,
  SourceError,
  VariantQueryDataResult,
  VariantQueryResponse,
} from '../../types';
import getLocalQuery from './adapters/localQueryAdapter';
import getRemoteTestNodeQuery from './adapters/remoteTestNodeAdapter';
import fetchCaddAnnotations from './utils/fetchCaddAnnotations';
import annotateCadd from './utils/annotateCadd';
import annotateGnomad from './utils/annotateGnomad';
import resolveAssembly from './utils/resolveAssembly';
import getG4rdNodeQuery from './adapters/g4rdAdapter';

const promiseExec = require('util').promisify(require('child_process').exec);
const tmpdir = require('os').tmpdir;
const fs = require('fs/promises');
const path = require('path');

const getVariants = async (parent: any, args: QueryInput): Promise<CombinedVariantQueryResponse> =>
  await resolveVariantQuery(args);

const isVariantQuery = (
  arg: VariantQueryResponse | CADDAnnotationQueryResponse
): arg is VariantQueryResponse => arg.source !== 'CADD annotations';

const resolveVariantQuery = async (args: QueryInput): Promise<CombinedVariantQueryResponse> => {
  const {
    input: {
      sources,
      variant: { assemblyId },
      gene: { position },
    },
  } = args;

  let annotationPosition = position;

  // fetch data
  const queries = sources.map(source => buildSourceQuery(source, args));
  const settledQueries = await Promise.allSettled([...queries]);

  const errors: SourceError[] = [];
  const combinedResults: VariantQueryDataResult[] = [];  

  /* inspect variant results and combine if no errors */
  settledQueries.forEach(response => {
    if (
      response.status === 'fulfilled' &&
      isVariantQuery(response.value) &&
      !response.value.error
    ) {
      combinedResults.push(...response.value.data);
    } else if (response.status === 'fulfilled' && !!response.value.error) {
      const message =
        process.env.NODE_ENV === 'production' && response.value.error.code === 500
          ? 'Something went wrong!'
          : response.value.error.message;

      errors.push({
        source: response.value.source,
        error: { ...response.value.error!, message },
      });
    } else if (response.status === 'rejected') {
      logger.error('UNHANDLED REJECTION!');
      logger.error(response.reason);
      throw new Error(response.reason);
    }
  });

  // filter data to send to liftover. 
  const dataForLiftover = combinedResults.filter(v => v.variant.assemblyId !== assemblyId); // datasets that need liftover
  const dataForAnnotation = combinedResults.filter(v =>                        // datasets that do not need liftover, but are ready for annotation 
    {if (resolveAssembly(v.variant.assemblyId) === assemblyId){
      v.variant.assemblyId = assemblyId;
      v.variant.assemblyIdCurrent = assemblyId;
      return true;
  }else return false;});
  const unliftedVariants: VariantQueryDataResult[] = [];              // datasets that failed liftover, can't be sent for annotation. 

  // Perform liftOver for liftOverDatasets
  if (dataForLiftover.length){
    // Get a bedstring of all data variants in JSON format. Note that position format is 1-based and BED format is half-open 0-based: https://genome.ucsc.edu/FAQ/FAQformat.html#format1
    const bedstring = dataForLiftover
      .map(v => `chr${v.variant.referenceName}\t${v.variant.start - 1}\t${v.variant.end}`)
      .join('\n');

    const createTmpFile = async () => {
      const filename = Math.random().toString(36).slice(2);
      const dir = await fs.mkdtemp(path.join(tmpdir(), 'liftover-'));
      return path.join(dir, filename);
    };

    const lifted = await createTmpFile();
    const unlifted = await createTmpFile();
    const bedfile = await createTmpFile();
    await fs.writeFile(bedfile, bedstring);
    let chain: string;
    if (assemblyId === "GRCh37"){
      chain = '/home/node/hg38ToHg19.over.chain';
    } else{
      chain = '/home/node/hg19ToHg38.over.chain';
    }
    await promiseExec(`liftOver ${bedfile} ${chain} ${lifted} ${unlifted}`);
    const _liftedVars = await fs.readFile(lifted);
    const _unliftedVars = await fs.readFile(unlifted);
    // We assume that the variants are SNV for now, so parseBed is only taking the field "start" because "start" == "end" for SNV.
    const parseBed = (bed: String) =>
      bed
        .split('\n')
        .filter(l => !!l && !l.startsWith('#'))
        .map(v => v.split('\t')[1]);
    const parseBedEnd = (bed: String) =>
      bed
        .split('\n')
        .filter(l => !!l && !l.startsWith('#'))
        .map(v => v.split('\t')[2]);
    const liftedVars = parseBed(_liftedVars.toString());
    const unliftedVars = parseBed(_unliftedVars.toString());
    const liftedVarsEnd = parseBedEnd(_liftedVars.toString());
    

    // mergeResults
    const unliftedMap: { [key: string]: boolean } = unliftedVars.reduce(
      (acc, curr) => ({ ...acc, [curr]: true }),
      {}
    );
    dataForLiftover.forEach((v,i)=>{
      if (unliftedMap[(v.variant.start - 1).toString()]) {
        v.variant.assemblyId = resolveAssembly(v.variant.assemblyId);
        v.variant.assemblyIdCurrent = v.variant.assemblyId;
        unliftedVariants.push(v);
      } else {
        v.variant.start = Number(liftedVars[i]) + 1; // Convert from BED format (half-open zero-based) to position format (1-based). We assume that the variants are SNV for now.
        v.variant.end = Number(liftedVarsEnd[i]);
        v.variant.assemblyId = resolveAssembly(v.variant.assemblyId);
        v.variant.assemblyIdCurrent = assemblyId;
        dataForAnnotation.push(v);
      }
    })

    // get position start end for annotation, only those that correspond to user input assembly 
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

    annotationPosition = `${dataForAnnotation[0].variant.referenceName}:${geneStart}-${geneEnd}`;
  }
  // Cadd Annotations
  const caddAnnotationsPromise = fetchCaddAnnotations(annotationPosition, assemblyId);
  const settledCadd = await Promise.allSettled([caddAnnotationsPromise]);

  // Handle annotations
  const caddAannotations = settledCadd.find(
    res => res.status === 'fulfilled' && !isVariantQuery(res.value)
  ) as PromiseFulfilledResult<CADDAnnotationQueryResponse>;

  let data: VariantQueryDataResult[] = []; 

  if (!!caddAannotations && !caddAannotations.value.error) {
    data = annotateCadd(dataForAnnotation, caddAannotations.value.data);
  }

  data = await annotateGnomad(data ?? dataForAnnotation);
  if (unliftedVariants.length){
    data = data.concat(unliftedVariants);
  }
  return { errors, data};
};

const buildSourceQuery = (source: string, args: QueryInput): Promise<VariantQueryResponse> => {
  switch (source) {
    case 'local':
      return getLocalQuery();
    case 'remote-test':
      return getRemoteTestNodeQuery(args);
    case 'g4rd':
      return getG4rdNodeQuery(args);
    default:
      throw new Error(`source ${source} not found!`);
  }
};

export default getVariants;