#! /usr/bin/env bash

set -euo pipefail

export PATH=$PATH:/opt/jboss/keycloak/bin
kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user "${KEYCLOAK_USER}" --password ${KEYCLOAK_PASSWORD}

#create realm, client, user
kcadm.sh create realms -s realm="${KEYCLOAK_REALM}" -s enabled=true
kcadm.sh create clients -r "${KEYCLOAK_REALM}" -s clientId="${KEYCLOAK_REACT_CLIENT_ID}" -s publicClient=true -s 'redirectUris=["'${REACT_URL}'/*"]' -i
kcadm.sh create clients -r "${KEYCLOAK_REALM}" -s clientId="${KEYCLOAK_SERVER_CLIENT_ID}" -s bearerOnly=true

kcadm.sh create users -s username=osmp-user -s enabled=true -r "${KEYCLOAK_REALM}"
kcadm.sh set-password -r "${KEYCLOAK_REALM}" --username osmp-user --new-password secret --temporary

kcadm.sh update realms/"${KEYCLOAK_REALM}" -s "loginTheme=osmp"

kcadm.sh create identity-provider/instances -r osmp -s alias=Auth0 -s providerId=oidc \
    -s enabled=true -s 'config.useJwksUrl="true"' \
    -s config.authorizationUrl="${AUTH0_BROKER_AUTH_URL}" \
    -s config.tokenUrl="${AUTH0_BROKER_TOKEN_URL}" \
    -s config.clientId="${AUTH0_BROKER_CLIENT_ID}" \
    -s config.clientSecret="${AUTH0_BROKER_CLIENT_SECRET}"
