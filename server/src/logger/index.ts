import buildDevLogger from './devLogger';
import buildProdLogger from './prodLogger';

const logger = process.env.TS_NODE_DEV ? buildDevLogger() : buildProdLogger();

export default logger;
