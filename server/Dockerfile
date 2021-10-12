FROM node:16-buster AS BUILD_IMAGE
LABEL org.opencontainers.image.source https://github.com/ccmbioinfo/ssmp

WORKDIR /usr/app

COPY . . 

RUN yarn && yarn run build

# Download binary, extract and remove archive
RUN wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz \
    && tar -zxvf mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz \
    && rm mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz

# Rename extracted
RUN mv mongodb-* /etc/mongodb

# Point env variable to binary
ENV MONGOMS_SYSTEM_BINARY=/etc/mongodb/bin/mongod
ENV MONGOMS_VERSION=4.2.8

FROM node:16-alpine as DEPLOY_IMAGE

WORKDIR /usr/app

COPY --from=BUILD_IMAGE /usr/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "run", "start-prod"]
