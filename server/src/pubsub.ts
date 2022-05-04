import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

pubsub.subscribe('SLURM_RESPONSE', (...args) => {
  console.log(JSON.stringify(args));
});

export { pubsub };
