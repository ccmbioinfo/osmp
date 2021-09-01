FROM node:16.3-buster

WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig.json ./
RUN yarn install
COPY . . 
RUN yarn run build

EXPOSE 8080
CMD ["yarn", "run", "start-prod"]