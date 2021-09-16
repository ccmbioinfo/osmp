#! /usr/bin/env bash

set -euo pipefail

# utility script for testing configurations
# should be replaced by CI config

# build react assets
docker-compose run --rm --entrypoint="yarn build" react
#build dev image
docker build -t ssmp:dev ./server
#bring up dev containers
docker-compose -f ./docker-compose.dev.yaml up
