FROM curlimages/curl AS download
WORKDIR /var/tmp
RUN curl -f -L -O https://hgdownload.cse.ucsc.edu/admin/exe/linux.x86_64/liftOver \
    -f -L -O https://hgdownload.cse.ucsc.edu/goldenpath/hg19/liftOver/hg19ToHg38.over.chain.gz \
    -f -L -O https://hgdownload.cse.ucsc.edu/goldenpath/hg38/liftOver/hg38ToHg19.over.chain.gz && \
    gunzip ./hg38ToHg19.over.chain.gz && \
    gunzip ./hg19ToHg38.over.chain.gz && \
    chmod +x ./liftOver

# Development image. Note that libcurl4 is a dependency of liftOver.
FROM node:16-slim AS dev
RUN  apt-get update && apt-get install -y libcurl4 && rm -rf /var/lib/apt/lists/*
COPY --from=download /var/tmp/liftOver /usr/local/bin 
COPY --from=download --chown=node:node /var/tmp/*.over.chain /home/node/

# This layer is shared between the builder and production stages
FROM dev AS base
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
