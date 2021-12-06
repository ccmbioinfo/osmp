import NodeCache from 'node-cache';

const Cache = new NodeCache();

export const putInCache = (key: string, val: string, ttl: number) => Cache.set(key, val, ttl);

export const getFromCache = (key: string) => Cache.get(key);

export const getCacheKeys = () => Cache.keys();
