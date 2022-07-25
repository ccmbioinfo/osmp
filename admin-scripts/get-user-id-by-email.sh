#!/bin/bash
# Fetch user ID from Auth0 using provided email
# Example usage:
# admin-scripts/add-users-by-email.sh <email>

set -euo pipefail

# adapted from https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3770333#gistcomment-3770333
# evaluate all "VAR=value" lines in .env; accounts for nested variables
eval $(cat .env | grep -v '^#' | grep -v '^$' | sed 's/\r$//' | awk '/=/ {print $1}' )

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

# lookup email using token
userobj=$(
    curl --request GET \
        --silent \
        --url "${G4RD_AUTH0_BASE_URL}api/v2/users-by-email?email=$1" \
        --header "Authorization: Bearer $accesstoken"
)
if [[ `echo "$userobj" | jq '.[0] | has("user_id")'` == "false" ]]; then
    # userid is missing
    echo "user_id is missing"
    exit 1
fi
userid=$(echo "$userobj" | jq -r '.[0]["user_id"]')
echo $userid
