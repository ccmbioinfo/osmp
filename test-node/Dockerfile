# This layer is shared between the builder and production stages
FROM node:16-slim AS base
WORKDIR /usr/src/app
COPY package*.json yarn.lock ./
RUN yarn --prod

# Builder stage: install development dependencies and transpile
FROM base AS builder
RUN yarn
COPY . .
RUN yarn tsc

# Final deployment-ready production image
FROM base
COPY --from=builder /usr/src/app/dist .
USER node
EXPOSE 3000
CMD ["node", "."]
