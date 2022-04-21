# A one-sided variant matching portal to support rare disease research

The One-Sided Matching Portal (OSMP) enables researchers to query patient variant and phenotype data from many different sources simultaneously. Acting as a hub connecting disparate data sources, the portal processes user queries, routes them to their respective endpoints with appropriate authorization, and amalgamates their results into a single, easily-searchable collection displayed in a user-friendly interface. By allowing researchers to search patient data from several research institutions with a single query, the OSMP can significantly speed up the process of rare disease “matching” across institutions and datasets.

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

### Connecting to Phenotips

The Phenotips variant matching endpoint specified [here](https://github.com/ccmbioinfo/report-scripts/blob/master/phenotips-api.md#matching-endpoint) can only be reached directly from our staging virtual machine ubuntu@ssmp-dev in the [CHEO-RI tenancy](https://github.com/ccmbioinfo/cheo-ri-infrastructure).

In development, for the Express server to successfully make a call to the endpoint, we need to use SSH's local forwarding protocol to forward a port from your local machine to the staging server machine. The SSH client listens to any requests or connections on a configured port, and when it receives a connection, it tunnels the connection to the SSH server.

If you are using CCM's VMs, you can set up local forwarding as follows:

- To login into your VM: `eval $(ssh-agent -s) && ssh-add` and `ssh -A <username>@dev-<username>.ccm.sickkids.ca`. Make sure that you already have a VM allocated to you.
- To forward your local port to ubuntu@ssmp-dev: `ssh -ANL 0.0.0.0:8443:dev.phenotips.genomics4rd.ca:443 ubuntu@ssmp.ccmdev.ca`. For now, this command would need to be run alongside `docker-compose up` when you want to bring up the app.
- Set `G4RD_URL` in your local `.env` to `https://dev-<username>.ccm.sickkids.ca:8443`.
  Now, any request sent to your `G4RD_URL` would be tunneled to `dev.phenotips.genomics4rd.ca:443` on the staging VM.

### Building the remote test server

Apart from Phenotips, another data source for the SSMP development instance is a Node/Express server that queries a MySQL database that has been populated wtih variants from the STAGER application database.

- make sure the `.env` file exists (see above)
- if this is your first time bringing up the app, install dependencies:
  - ```bash
    docker-compose run --rm --entrypoint='yarn install' test-node-1
    ```
- bring up the server using [docker-compose](https://docs.docker.com/compose/):

  - ```bash
    docker-compose up test-node-1
    ```

- to populate MySQL database with variants from STAGER, download this [script](https://sickkidsca.sharepoint.com/:u:/r/sites/thecenterforcomputationalmedicineworkspace/Shared%20Documents/SSMP/data/stager-local-20210716.sql?csf=1&web=1&e=fVzHIB) and run the script using one of these two options:
  - MySQLWorkbench
  - ```bash
    docker exec -i <stager-mysql-container-name> mysql -u <env.STAGER_DB_USER> --password="<env.STAGER_DB_PASSWORD>" <env.STAGER_DB> < <filepath>.sql
    ```
    where the `.sql` script is on the host machine.

## Keycloak

The app uses [keycloak](https://www.keycloak.org/) as an identity provider and identity broker. Essentially, keycloak stores all user information and the app is a keycloak client. The implementation is currently in its earliest phases and documentation will be updated as the project evolves.

In the dev environment, the app uses keycloak's default h2 database for storage, though in production we'll want to use MySQL or Postgres. To set up the app client and a test user, you can use the following command on your host machine with the keycloak container running:

```bash
docker exec -i <keycloak-container-name> bash /usr/scripts/bootstrap-keycloak.sh
```

The keycloak admin portal can be accessed in the browser by navigating to localhost and the port specified by the `KEYCLOAK_PORT` env var, e.g., `localhost:9821`

To request an access token to Keycloak: 
```bash
export TOKEN=$(curl --location --request POST 'http://localhost:9821/auth/realms/ssmp/protocol/openid-connect/token' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'password=secret' --data-urlencode 'username=ssmp-user' --data-urlencode 'client_id=ssmp-backend' --data-urlencode 'realm=ssmp' --data-urlencode 'grant_type=password' | jq -r '.access_token')
```

To access a protected endpoint on the backend: 
```bash
curl -X POST http://localhost:5862/graphql -H "Authorization: Bearer '$TOKEN'" \
--header 'Content-Type: application/json' \
--data-raw '{"name":"John", "age":30, "car":null, "id": 100, "kind": "subscription"}'
```

## Mongo

Annotations can be imported into mongo using the following command. Note that that the headers should not be included in the csv and the order of the fields passed to the `fields` argument should match the order of the fields in the csv.

```bash
mongoimport --collection=annotations --type=csv \
   --columnsHaveTypes \
   --fields="pos.int32(),ref.string(),alt.string(),chrom.string(),nhomalt.int32(),an.int32(),af.double(),assembly.string()" \
   --file=<filename>.csv \
   --uri=mongodb://<env.MONGO_INITDB_ROOT_USERNAME>:<env.MONGO_INITDB_ROOT_PASSWORD>@mongo/<env.MONGO_INITDB_DATABASE>?authSource=admin
```

Then make sure to create the following indexes:

```
db.annotations.createIndexes([ {"pos": 1}, {"assembly":1}, {"alt": 1, "chrom": 1, "pos": 1, "ref": 1 } ])
```
