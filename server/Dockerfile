FROM node:16 AS BUILD_IMAGE
LABEL org.opencontainers.image.source https://github.com/ccmbioinfo/ssmp
RUN curl --remote-name https://krishna.gs.washington.edu/download/CADD/v1.6/GRCh38/whole_genome_SNVs_inclAnno.tsv.gz.tbi
WORKDIR /usr/app
COPY package*.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:16-slim as DEPLOY_IMAGE 
WORKDIR /usr/app
COPY --from=BUILD_IMAGE /usr/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/app/package.json ./package.json
COPY --from=BUILD_IMAGE /home/node/cadd_wgs_ghr38_index.gz.tbi /home/node/cadd_wgs_ghr38_index.gz.tbi
EXPOSE 3000
CMD ["yarn", "run", "start-prod"]
