# Local Development Environment

## Front End

The front end is a React.js SPA bootstrapped with [create-react-app](https://github.com/facebook/create-react-app) and written in [Typescript](https://www.typescriptlang.org/). [Styled-components](https://styled-components.com/docs) is used for theming and styling. Additional component tooling is provided by [storybook](https://storybook.js.org/).

### Building and editing the front end code

- from the root project directory, copy the sample `.env` file and enter the appropriate values:
  - ```bash
    cp .env.sample .env
    ```
- if this is your first time bringing up the app, install the dependencies:
  - ```bash
    docker-compose run --rm react yarn install
    ```
- bring up the react app using [docker-compose](https://docs.docker.com/compose/):

  - ```bash
    docker-compose up react
    ```
  - note that this will enable hot reloading.

- (optional) start the storybook server:
  - ```bash
        docker-compose exec -i react yarn storybook
    ```

## Server

The back end is a node.js server built with [express](https://expressjs.com/), [Typescript](https://www.typescriptlang.org/), and [graphql](https://graphql.org/).

### Building and editing the back end code

- make sure the `.env` file exists (see above)
- if this is your first time bringing up the app, install the dependencies:
  - ```bash
    docker-compose run --rm server yarn install
    ```
- bring up the server using [docker-compose](https://docs.docker.com/compose/):

  - ```bash
    docker-compose up server
    ```
  - note that this will recompile the typescript and restart the server when changes are detected.

- to run the tests:
  - ```bash
    docker-compose run --rm server yarn test
    ```

### Connecting to Phenotips

The Phenotips staging instance's API endpoint is specified by the `G4RD_URL` env var. The OSMP server uses the OSMP machine account specified by `G4RD_USERNAME` and `G4RD_PASSWORD` to authenticate to the endpoint. The Phenotips staging site can be accessed in the browser by navigating to the URL specified by the `G4RD_URL` env var, using the OSMP machine account.

Phenotips API documentation can be found [here](https://help.phenotips.com/hc/en-us/articles/360048543632-Variant-Store-Add-on-REST-API).

### Building the remote test server

Apart from Phenotips, another data source for the staging instance is a Node/Express server that queries a MySQL database that has been populated wtih variants from the STAGER application database.

- make sure the `.env` file exists (see above)
- if this is your first time bringing up the app, install the dependencies:
  - ```bash
    docker-compose run --rm test-node yarn install
    ```
- bring up the server using [docker-compose](https://docs.docker.com/compose/):

  - ```bash
    docker-compose up test-node
    ```

- to populate the MySQL database with variants from STAGER, download this [script](https://sickkidsca.sharepoint.com/:u:/r/sites/thecenterforcomputationalmedicineworkspace/Shared%20Documents/SSMP/data/stager-local-20210716.sql?csf=1&web=1&e=fVzHIB) and run the script using one of these two options:
  - MySQLWorkbench
  - ```bash
    docker exec -i <stager-mysql-container-name> mysql -u <env.TEST_DATA_DB_USER> --password="<env.TEST_DATA_DB_PASSWORD>" <env.TEST_DATA_DB> < <filepath>.sql
    ```
    where the `.sql` script is on the host machine.

## Keycloak

The app uses [keycloak](https://www.keycloak.org/) as an identity provider and identity broker. Essentially, keycloak stores all user information and the app is a keycloak client. The implementation is currently in its earliest phases and documentation will be updated as the project evolves.

In the dev environment, the app uses keycloak's default h2 database for storage, though in production we'll want to use MySQL or Postgres. To set up the app client and a test user, you can use the following command on your host machine with the keycloak container running:

```bash
docker-compose exec keycloak /usr/local/bin/bootstrap-keycloak.sh
```

The keycloak admin portal can be accessed in the browser by navigating to localhost and the port specified by the `KEYCLOAK_PORT` env var, e.g., `localhost:9821`

## Mongo

gnomAD annotations are performed on-the-fly using MongoDB. The staging VM and production VM are connected to the MongoDB instance in the CHEO-RI tenancy. Since dev VMs are not in the CHEO-RI tenancy, they cannot connect to the MongoDB instance in the CHEO-RI tenancy. Instead, in local development, we can connect to [mongodb.ccm.sickkids.ca](mongodb.ccm.sickkids.ca) which currently only supports GRCh37 annotations and a small subset of GRCh38 annotations.

Annotations were imported into mongo using the following command. Note that that the headers should not be included in the csv and the order of the fields passed to the `fields` argument should match the order of the fields in the csv.

```bash
mongoimport --collection=annotations --type=csv \
   --columnsHaveTypes \
   --fields="pos.int32(),ref.string(),alt.string(),chrom.string(),nhomalt.int32(),an.int32(),af.double(),assembly.string()" \
   --file=<filename>.csv \
   --uri=mongodb://<env.MONGO_INITDB_ROOT_USERNAME>:<env.MONGO_INITDB_ROOT_PASSWORD>@mongo/<env.MONGO_INITDB_DATABASE>?authSource=admin
```

Then make sure to create the following indexes to optimize the query:

```
db.annotations.createIndexes([ {"pos": 1}, {"assembly":1}, {"alt": 1, "chrom": 1, "pos": 1, "ref": 1 } ])
```
