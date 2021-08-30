import buildDevLogger from './devLogger';
import buildProdLogger from './prodLogger';

const logger = process.env.NODE_ENV !== 'production' ? buildDevLogger() : buildProdLogger();

export default logger;
