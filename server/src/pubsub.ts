import { PubSub } from 'graphql-subscriptions';
import logger from './logger';

const pubsub = new PubSub();

pubsub.subscribe('SLURM_RESPONSE', (...args) => {
  logger.info(`Slurm response: ${JSON.stringify(args)}`)
});

export { pubsub };
