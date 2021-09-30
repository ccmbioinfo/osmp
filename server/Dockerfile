FROM node:16-buster AS BUILD_IMAGE
LABEL org.opencontainers.image.source https://github.com/ccmbioinfo/ssmp

WORKDIR /usr/app

COPY . . 

RUN yarn && yarn run build

FROM node:16-alpine as DEPLOY_IMAGE

WORKDIR /usr/app

COPY --from=BUILD_IMAGE /usr/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "run", "start-prod"]
