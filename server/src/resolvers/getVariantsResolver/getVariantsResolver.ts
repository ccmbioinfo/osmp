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
const tmpdir = require('os').tmpdir
const fs = require('fs/promises');
const fsExec = require('fs');
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

  // fetch data
  const queries = sources.map(source => buildSourceQuery(source, args));
  const settledQueries = await Promise.allSettled([...queries]);

  const errors: SourceError[] = [];
  let combinedResults: VariantQueryDataResult[] = [];

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
  let pos = position;

  if (resolveAssembly(assemblyId)==='GRCh38'){
      // Get a bedstring of all data variants in JSON format. Note that position format is 1-based and BED format is half-open 0-based: https://genome.ucsc.edu/FAQ/FAQformat.html#format1  The transformation v.variant.end-1 is only necessary if the variants are SNV because BED format is half-open. 
    const bedstring = combinedResults.map(v => v.variant.start === v.variant.end ? `chr${v.variant.referenceName}\t${v.variant.start-1}\t${v.variant.end-1}` : `chr${v.variant.referenceName}\t${v.variant.start-1}\t${v.variant.end}` ).join("\n");
  
    const createTmpFile = async () => {
      const filename = Math.random().toString(36).slice(2);
      const dir = await fs.mkdtemp(path.join(tmpdir(), 'liftover-'));
      return path.join(dir, filename);
    };

    const lifted = await createTmpFile();
    const unlifted = await createTmpFile();
    const bedfile = await createTmpFile();
    await fs.writeFile(bedfile, bedstring);
    const chain = "/usr/src/app/chain/hg19ToHg38.over.chain";
    fsExec.chmod("/usr/src/app/liftOver", fsExec.constants.S_IXUSR, async ()=>{
      await promiseExec(`"/usr/src/app/liftOver" ${bedfile} ${chain} ${lifted} ${unlifted}`);
      const _liftedVars = await fs.readFile(lifted);
      const _unliftedVars = await fs.readFile(unlifted);
      // We assume that the variants are SNV for now, so parseBed is only taking the field "start" because "start" == "end" for SNV.
      const parseBed = (bed: String) => bed.split("\n").filter(l => !!l && !l.startsWith("#")).map(v => v.split("\t")[2]);
      const liftedVars = parseBed(_liftedVars.toString());
      const unliftedVars = parseBed(_unliftedVars.toString());
      combinedResults = mergeResults(liftedVars, unliftedVars); 
      // get position start end by looping to find min of all the "start" fields and max of all the "end" fields
      let geneStart = combinedResults[0].variant.start;
      let geneEnd = combinedResults[0].variant.end;

      combinedResults.forEach((result) => {
        if (result.variant.start < geneStart){
          geneStart = result.variant.start;
        }
        if (result.variant.end > geneEnd){
          geneEnd = result.variant.end;
        }
      })

      pos = `${combinedResults[0].variant.referenceName}:${geneStart}-${geneEnd}`; 
    });
    
    const mergeResults = (lifted: Array<string>, unlifted: Array<string>) => {

      const unliftedVariants: VariantQueryDataResult[] = [];

      const unliftedMap: { [key: string]: boolean}  = unlifted.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});

      return combinedResults.filter(v => {
          if (unliftedMap[(v.variant.start-1).toString()]) {
              unliftedVariants.push(v);
              return false;
          } else {
              return true;
          }
      }).map((v, i) => { 
        v.variant.start=Number(lifted[i]) + 1; // Convert from BED format (half-open zero-based) to position format (1-based). We assume that the variants are SNV for now. 
        v.variant.end=Number(lifted[i]) + 1;
        return {...v}}).concat(unliftedVariants)
    }   
  } 
  const caddAnnotationsPromise = fetchCaddAnnotations(pos, assemblyId);
  const settledCadd = await Promise.allSettled([caddAnnotationsPromise]);

  // Handle annotations
  const caddAannotations = settledCadd.find(
    res => res.status === 'fulfilled' && !isVariantQuery(res.value)
  ) as PromiseFulfilledResult<CADDAnnotationQueryResponse>;

  let data;

  if (!!caddAannotations && !caddAannotations.value.error) {
    data = annotateCadd(combinedResults, caddAannotations.value.data);
  }

  data = await annotateGnomad(data ?? combinedResults);

  return { errors, data };
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
