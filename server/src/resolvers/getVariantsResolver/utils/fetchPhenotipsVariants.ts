/**
 * Handles fetching from /rest/variants/match endpoint in Phenotips.
 */
import axios from 'axios';
import { GeneQueryInput, PTPaginatedVariantQueryResult, VariantQueryInput } from '../../../types';
import logger from '../../../logger';
import resolveChromosome from './resolveChromosome';
import { QueryResponseError } from './queryResponseError';

const COUNT = 25;

/**
 * Return a complete list of results from Phenotips with a given query to /rest/variants/match.
 * Collects paginated results as a single array of results.
 *
 * @param baseUrl The URL where the Phenotips instance is hosted. Used as {baseUrl}/rest/variants/match
 * @param gene Gene query parameter.
 * @param variant Variant query parameter.
 * @param authorization Authorization header string to use with query.
 * @throws
 */
const fetchPhenotipsVariants = async (
  baseUrl: string,
  gene: GeneQueryInput,
  variant: VariantQueryInput,
  authorization: string
): Promise<PTPaginatedVariantQueryResult['results']> => {
  let currentPage = 1;
  let collectedResults: PTPaginatedVariantQueryResult['results'] = [];
  let maxResults = Infinity;
  const count = COUNT;
  const position = resolveChromosome(gene.position);

  logger.debug(`Begin fetching paginated variants from ${baseUrl}. gene: ${JSON.stringify(gene)}, variant: ${JSON.stringify(variant)}`);
  do {
    try {
      const variantQueryResponse = await axios.post<PTPaginatedVariantQueryResult>(
        `${baseUrl}/rest/variants/match`,
        {
          page: currentPage,
          limit: count,
          variant: {
            ...variant,
            position: {
              chrom: Number(position.chromosome),
              start: Number(position.start),
              end: Number(position.end),
            }
          },
        },
        {
          headers: {
            Authorization: authorization,  // TODO: In future, use function instead to get auth?
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      if (variantQueryResponse && variantQueryResponse.data.exists) {
        const { results, numTotalResults } = variantQueryResponse.data;
        logger.debug(`Successful query of page ${currentPage}, limit ${count}, total: ${numTotalResults}`);
        // expect page = currentPage, limit = count
        maxResults = numTotalResults;
        collectedResults = collectedResults.concat(results);
        currentPage += 1;
      } else {
        if (collectedResults.length === 0) {
          logger.warn(`Variant data does not exist at position ${JSON.stringify(position)}`);
          return [];
        } else {
          // it would be really weird if this happened. the error existed on one page but not the next?
          logger.error(`Position '${JSON.stringify(position)}' has missing data on page ${currentPage} somehow??`);
          throw new QueryResponseError({
            code: 500,
            message: "Internal Server Error",
            source: "OSMP"
          });
        }
      }
    } catch (error: any) {
      logger.error(JSON.stringify(error));
      throw error; // Adapters will need to handle this error
    }
  } while (collectedResults.length < maxResults);
  logger.debug(`Fetched ${collectedResults.length} variants across ${currentPage-1} pages from ${baseUrl}`);

  return collectedResults;
};

export default fetchPhenotipsVariants;
