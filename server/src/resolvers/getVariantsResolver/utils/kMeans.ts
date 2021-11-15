import {
  featureCollection,
  point,
  Feature,
  Properties,
  Point,
  FeatureCollection,
} from '@turf/helpers';
import clustersKmeans from '@turf/clusters-kmeans';

type FeatureCollectionCluster = FeatureCollection<
  Point,
  {
    [name: string]: any;
  } & {
    cluster?: number | undefined;
    centroid?: [number, number] | undefined;
  }
>;

export const getKMeansCluster = (position: string[], k?: number) => {
  const points: Feature<Point, Properties>[] = [];

  [...new Set(position)].forEach(p => {
    const chrom = p.match(/^[^:]*[^ :]/gm)?.join('');
    const coordinates = p.match(/\w[^:]*$/gm)?.join('');
    const end = coordinates?.match(/\w[^-]*$/gm);
    const start = coordinates?.match(/^[^-]*[^ -]/gm);
    if (start && end) points.push(point([Number(start), Number(end)], { chrom: chrom }));
  });

  const pointsCollection = featureCollection(points);

  const cluster = clustersKmeans(pointsCollection, { numberOfClusters: k });

  return cluster;
};

/**
 * Group based on cluster id
 * Find min max
 * Return position stirng
 */

interface Cluster {
  coordinates: number[][];
  chrom: string;
}

export const getClusterPosition = (clusterCollection: FeatureCollectionCluster) => {
  const cluster: Record<string, Cluster> = {};

  clusterCollection.features.forEach(c => {
    const id = c.properties.cluster!;
    if (id in cluster) {
      cluster[id].coordinates = [c.geometry.coordinates, ...cluster[id].coordinates];
    } else {
      cluster[id] = {
        coordinates: [],
        chrom: c.properties.chrom,
      };
      cluster[id].coordinates = [c.geometry.coordinates];
    }
  });

  return Object.values(cluster).map(v => {
    const start = Math.min(...v.coordinates.map(a => a[0]));
    const end = Math.max(...v.coordinates.map(a => a[1]));
    return `${v.chrom}:${start}-${end}`;
  });
};
