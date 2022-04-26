import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

pubsub.subscribe('SLURM_RESPONSE', (...args) => {
  console.log('hello subscribe', args);
});

export { pubsub };
