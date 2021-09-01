FROM node:16.3-buster AS builder

WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig.json ./
RUN yarn install
COPY . . 
RUN yarn build

CMD ["yarn", "start"]

FROM nginx
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/app/build /usr/share/nginx/html