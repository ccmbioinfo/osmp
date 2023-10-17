/**
 * Handles fetching from /rest/variants/match endpoint in Phenotips.
 */
import axios from 'axios';
import { GeneQueryInput, PTPaginatedVariantQueryResult, VariantQueryInput } from '../../../types';
import logger from '../../../logger';

const COUNT = 25;

/**
 * Return a complete list of results from Phenotips with a given query to /rest/variants/match.
 * Collects paginated results as a single array of results.
 *
 * @param baseUrl The URL where the Phenotips instance is hosted. Used as {baseUrl}/rest/variants/match
 * @param gene Gene query parameter.
 * @param variant Variant query parameter.
 * @param getAuthorization Function that returns an Authorization header string to use with query.
 * @throws
 */
const fetchPhenotipsVariants = async (
  baseUrl: string,
  gene: GeneQueryInput,
  variant: VariantQueryInput,
  getAuthorization: () => string
): Promise<PTPaginatedVariantQueryResult['results']> => {
  let currentPage = 1;
  let collectedResults: PTPaginatedVariantQueryResult['results'] = [];
  let maxResults = Infinity;
  let count = COUNT;
  do {
    try {
      let variantQueryResponse = await axios.post<PTPaginatedVariantQueryResult>(
        `${baseUrl}/rest/variants/match`,
        {
          page: currentPage,
          limit: count,
          gene,
          variant,
        },
        {
          headers: {
            Authorization: getAuthorization(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      if (variantQueryResponse && variantQueryResponse.data.exists) {
        let { results, numTotalResults } = variantQueryResponse.data;
        // expect page = currentPage, limit = count
        maxResults = numTotalResults;
        collectedResults = collectedResults.concat(results);
        currentPage += 1;
      } else {
        break;
      }
    } catch (error: any) {
      logger.error(error);
      throw error; // Adapters will need to handle this error
    }
  } while (collectedResults.length < maxResults);

  return collectedResults;
};

export default fetchPhenotipsVariants;
