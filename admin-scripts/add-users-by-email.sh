#!/bin/bash
#
# Add new users to osmp realm based on file of newline-separated emails.
# Each line must end with a newline.
# Example usages:
# cat emails.txt | admin-scripts/add-users-by-email.sh
# admin-scripts/add-users-by-email.sh emails.txt

set -euo pipefail

# adapted from https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3770333#gistcomment-3770333
# evaluate all "VAR=value" lines in .env; accounts for nested variables
eval $(cat .env | grep -v '^#' | grep -v '^$' | sed 's/\r$//' | awk '/=/ {print $1}' )

docker-compose exec keycloak /opt/jboss/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user "${KEYCLOAK_USER}" --password ${KEYCLOAK_PASSWORD}

# Get management API access token (assuming it's Auth0)
if [ "${AUTH0_GRANT_TYPE}" = "password" ]; then
    tokenresponse=$(curl --request POST \
        --url "${G4RD_TOKEN_URL}" \
        --header "Content-Type: application/x-www-form-urlencoded" \
        --data "client_id=${G4RD_CLIENT_ID}" \
        --data "grant_type=password" \
        --data "username=${G4RD_USERNAME}" \
        --data "password=${G4RD_PASSWORD}" \
        --data "audience=${G4RD_AUTH0_BASE_URL}api/v2/"
    )
else
    tokenresponse=$(curl --request POST \
        --url "${G4RD_TOKEN_URL}" \
        --header "Content-Type: application/x-www-form-urlencoded" \
        --data "client_id=${G4RD_CLIENT_ID}" \
        --data "grant_type=client_credentials" \
        --data "client_secret=${G4RD_CLIENT_SECRET}" \
        --data "audience=${G4RD_AUTH0_BASE_URL}api/v2/"
    )
fi

accesstoken=$(
    echo "${tokenresponse}" | jq -r '."access_token"'
)

# Get users by email
file=${1:--}

# read line-by-line, no newline
while IFS= read -r line; do
    # lookup email using token
    userobj=$(
        curl --request GET \
            --url "${G4RD_AUTH0_BASE_URL}api/v2/users-by-email?email=${line}" \
            --header "Authorization: Bearer $accesstoken"
    )
    userid=$(echo "$userobj" | jq -r '.[]["user_id"]')

    # try to add user to keycloak with this id
    printf "Adding user with email '%s' and id '%s'... " "$line" "$userid"
    set +e
    docker-compose exec keycloak /opt/jboss/keycloak/bin/kcadm.sh create users -s username="$userid" -s email="$line" -s enabled=true -r "${KEYCLOAK_REALM}"
    if [[ $? -eq 0 ]]; then
        printf "User added successfully\n"
    else
        printf "Failed to add user\n"
    fi
    set -e
done < <(cat -- "$file")
