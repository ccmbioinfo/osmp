# Production

OSMP is deployed via Compose at [https://osmp.genomics4rd.ca](https://osmp.genomics4rd.ca). The key differences between the staging and production are the removal of the test node and increased memory and CPU resource allocations for the `server` container. The OSMP production instance is connected to the [production instance of G4RD Phenotips](https://phenotips.genomics4rd.ca). Similar to the staging stack, to deploy the frontend, compiled static bundles are uploaded to a designated MinIO bucket. The routing between the frontend and backend is handled by the HAProxy reverse proxy.

## Continuous deployment through Github Actions

On each commit to the `production` branch, if the changes affect the backend, a Github Actions workflow [Build, test, and deploy backend to production](https://github.com/ccmbioinfo/osmp/blob/develop/.github/workflows/node-prod.yml) is run. After the Docker image build and test stages pass, we move to the deployment stage. This stage runs on a self-hosted Actions runner that is networked with the production host, and deploys the backend to the production host.

If the changes affect the frontend, a different workflow [Build react app and deploy to production](https://github.com/ccmbioinfo/osmp/blob/develop/.github/workflows/react-prod.yml) builds the frontend, incorporating environment-specific configurations as needed, and uploads the compiled static bundles to a designated S3 (MinIO) bucket.
