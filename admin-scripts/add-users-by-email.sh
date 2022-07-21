#!/bin/bash
#
# Add new users to osmp realm based on file of newline-separated emails.
# Each line must end with a newline.
# Example usages:
# cat emails.txt | admin-scripts/add-users-by-email.sh
# admin-scripts/add-users-by-email.sh emails.txt

set -euo pipefail

PROVIDER=Auth0

# adapted from https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3770333#gistcomment-3770333
# evaluate all "VAR=value" lines in .env; accounts for nested variables
eval $(cat .env | grep -v '^#' | grep -v '^$' | sed 's/\r$//' | awk '/=/ {print $1}' )

docker-compose exec keycloak /opt/jboss/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user "${KEYCLOAK_USER}" --password ${KEYCLOAK_PASSWORD}

# Get management API access token (assuming it's Auth0)
if [ "${G4RD_GRANT_TYPE}" = "password" ]; then
    tokenresponse=$(curl --request POST \
        --silent \
        --url "${G4RD_TOKEN_URL}" \
        --header "Content-Type: application/x-www-form-urlencoded" \
        --data "client_id=${G4RD_CLIENT_ID}" \
        --data "grant_type=password" \
        --data "username=${G4RD_USERNAME}" \
        --data "password=${G4RD_PASSWORD}" \
        --data "audience=${G4RD_AUTH0_BASE_URL}api/v2/" \
        --data "scope=read:users"
    )
else
    tokenresponse=$(curl --request POST \
        --silent \
        --url "${G4RD_TOKEN_URL}" \
        --header "Content-Type: application/x-www-form-urlencoded" \
        --data "client_id=${G4RD_CLIENT_ID}" \
        --data "grant_type=client_credentials" \
        --data "client_secret=${G4RD_CLIENT_SECRET}" \
        --data "audience=${G4RD_AUTH0_BASE_URL}api/v2/" \
        --data "scope=read:users"
    )
fi

accesstoken=$(
    echo "${tokenresponse}" | jq -r '."access_token"'
)

if [[ "$accesstoken" == "null" ]]; then
    echo "Failed to gain access token"
    exit 1
fi

# Get users by email
file=${1:-/dev/stdin}

# read line-by-line, no newline
set +e
for line in $(cat $file)
do
    # lookup email using token
    userobj=$(
        curl --request GET \
            --silent \
            --url "${G4RD_AUTH0_BASE_URL}api/v2/users-by-email?email=${line}" \
            --header "Authorization: Bearer $accesstoken"
    )
    if [[ `echo "$userobj" | jq '.[0] | has("user_id")'` == "false" ]]; then
        # userid is missing
        printf "user_id for '$line' is missing\nFailed to add user\n"
        continue
    fi
    userid=$(echo "$userobj" | jq -r '.[0]["user_id"]')
    # try to add user to keycloak with this id
    printf "Adding user with email '%s' and id '%s'...\n" "$line" "$userid"
    set +e
    docker-compose exec -T keycloak /opt/jboss/keycloak/bin/kcadm.sh create users -r "${KEYCLOAK_REALM}" -s username="$userid" -s email="$line" -s enabled=true
    if [[ $? -eq 0 ]]; then
        printf "User added successfully\n"
    else
        printf "Failed to add user\n"
        set -e
        continue
    fi
    kcuserid=$(
        docker-compose exec -T keycloak /opt/jboss/keycloak/bin/kcadm.sh get users -r "${KEYCLOAK_REALM}" -q email="$line" \
        | jq -r '.[0]["id"]'
    )
    # Add new federated identity link to user (uses PROVIDER variable as provider name)
    # use jq to validate
    newlink=$(
        echo "{\"identityProvider\": \"Auth0\", \"userId\": \"$userid\", \"userName\": \"$userid\"}" | jq -rc '.'
    )

    docker-compose exec -T keycloak /opt/jboss/keycloak/bin/kcadm.sh create users/"$kcuserid"/federated-identity/"$PROVIDER" -r "${KEYCLOAK_REALM}" -b "$newlink"
    if [[ $? -eq 0 ]]; then
        printf "Identity link added successfully\n"
        echo $newlink
    else
        printf "Failed to add identity link\n"
        set -e
        continue
    fi

    set -e

done
