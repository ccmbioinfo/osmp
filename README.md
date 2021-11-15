# A one-sided variant matching portal to support rare disease research

## Front End

The front end is a React.js SPA bootstrapped with [create-react-app](https://github.com/facebook/create-react-app) and written in [Typescript](https://www.typescriptlang.org/). [Styled-components](https://styled-components.com/docs) is used for theming and styling. Additional component tooling provided by [storybook](https://storybook.js.org/).

### Building and editing the front end code

- from the root project directory copy the sample .env file and enter the appropriate values
  - ```bash
    cp .env.sample .env
    ```
- if this is your first time bringing up the app, install dependencies:
  - ```bash
    docker-compose run --rm --entrypoint='yarn install' react
    ```
- bring up the react app using [docker-compose](https://docs.docker.com/compose/):

  - ```bash
    docker-compose up react
    ```
  - note that this will enable hot reloading.

- (optional) start the storybook server
  - ```bash
        docker-compose exec -i react yarn storybook
    ```

## Server

The back end is a node.js server built with [express](https://expressjs.com/), [Typescript](https://www.typescriptlang.org/), and [graphql](https://graphql.org/).

### Building and editing the back end code

- make sure the `.env` file exists (see above)
- if this is your first time bringing up the app, install dependencies:
  - ```bash
    docker-compose run --rm --entrypoint='yarn install' ssmp-server
    ```
- bring up the server using [docker-compose](https://docs.docker.com/compose/):

  - ```bash
    docker-compose up ssmp-server
    ```
  - note that this will recompile the typescript and restart the server when changes are detected.

- to run the tests:
  - ```bash
    docker-compose run --rm --entrypoint='yarn test' ssmp-server
    ```

## Keycloak

The app uses [keycloak](https://www.keycloak.org/) as an identity provider and identity broker. Essentially, keycloak stores all user information and the app is a keycloak client. The implementation is currently in its earliest phases and documentation will be updated as the project evolves.

In the dev environment, the app uses keycloak's default h2 database for storage, though in production we'll want to use MySQL or Postgres. To set up the app client and a test user, you can use the following command on your host machine with the keycloak container running:

```bash
docker exec -i <keycloak-container-name> bash /usr/scripts/bootstrap-keycloak.sh
```

The keycloak admin portal can be accessed in the browser by navigating to localhost and the port specified by the `KEYCLOAK_PORT` env var, e.g., `localhost:9821`

## Mongo

Annotations can be imported into mongo using the following command. Note that that the headers should not be included in the csv and the order of the fields passed to the `fields` argument should match the order of the fields in the csv.

```bash
mongoimport --db=annotations --collection=annotations --type=csv \
   --columnsHaveTypes \
   --fields="pos.int32(),ref.string(),alt.string(),chrom.string(),nhomalt.int32(),an.int32(),af.double(),assembly.string()" \
   --file=<filename>.csv \
   -u <username> --password=<pass> --authenticationDatabase=admin
```

Then make sure to create the following indexes:

```
db.annotations.createIndexes([ {"pos": 1}, {"assembly":1}, {"alt": 1, "chrom": 1, "pos": 1, "ref": 1 } ])
```
