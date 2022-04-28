# This stage is tagged for local development.
FROM node:16-slim AS dev
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y wget libcurl4
RUN wget -O /usr/local/bin/liftOver https://hgdownload.cse.ucsc.edu/admin/exe/linux.x86_64/liftOver  \
  && chmod +x /usr/local/bin/liftOver
COPY . .
WORKDIR /home/node
RUN mkdir chains && \
  wget -O ./chains/hg19ToHg38.over.chain.gz https://hgdownload.cse.ucsc.edu/goldenpath/hg19/liftOver/hg19ToHg38.over.chain.gz && \
  wget -O ./chains/hg38ToHg19.over.chain.gz https://hgdownload.cse.ucsc.edu/goldenpath/hg38/liftOver/hg38ToHg19.over.chain.gz && \
  gunzip ./chains/hg38ToHg19.over.chain.gz && \
  gunzip ./chains/hg19ToHg38.over.chain.gz
RUN chown -R node:node ./ && chown -R node:node /home/node
WORKDIR /usr/src/app


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
COPY --from=builder /usr/src/app/dist .
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "."]
