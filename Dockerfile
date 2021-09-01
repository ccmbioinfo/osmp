# Build node - Stage 1
FROM node:16.3-buster as build-stage

WORKDIR /ssmp/server
COPY ./server/package*.json ./
COPY ./server/tsconfig.json ./
RUN yarn install
COPY ./server ./ 
RUN yarn run build

#Stage 2
FROM node:16.3-buster
WORKDIR /ssmp/server
COPY ./server/package*.json ./
COPY ./server/tsconfig.json ./
RUN yarn install
COPY --from=0 /ssmp/server/dist ./dist

#get the latest alpine image from nginx registry
FROM nginx:alpine

#Not sure what to do here yet
COPY --from=build-stage /app/build/ /usr/share/nginx/html