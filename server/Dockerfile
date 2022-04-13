# This stage will probably be removed when we index GRCh38 ourselves
FROM curlimages/curl AS tbi
WORKDIR /var/tmp
RUN curl --output cadd_wgs_ghr38_index.gz.tbi https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh38/whole_genome_SNVs_inclAnno.tsv.gz.tbi

# This stage is tagged for local development to guarantee the index is in the container
FROM node:16-slim AS dev
WORKDIR /usr/src/app
COPY --from=tbi --chown=node:node /var/tmp/cadd_wgs_ghr38_index.gz.tbi /home/node

# This layer is shared between the builder and production stages
FROM node:16-slim AS base
WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn --prod

# Builder stage: install development dependencies and transpile
FROM base AS builder
RUN yarn
COPY . .
RUN yarn build

# Final deployment-ready production image
FROM base
COPY --from=tbi --chown=node:node /var/tmp/cadd_wgs_ghr38_index.gz.tbi /home/node
COPY --from=builder /usr/src/app/dist .
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "."]
