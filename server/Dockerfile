# Build node - Stage 1
FROM node:16.3-buster

WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig.json ./
RUN yarn install
COPY ./ ./
RUN yarn run build

