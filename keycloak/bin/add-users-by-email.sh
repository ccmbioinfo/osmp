#! /usr/bin/env bash
#
# Add new users to osmp realm based on file of newline-separated emails.
# Each line must end with a newline.

# Example usage with Docker:
# cat emails.txt | docker exec -i <keycloak_container> bash /usr/local/bin/add-users-by-email.sh

set -euo pipefail

export PATH=$PATH:/opt/jboss/keycloak/bin
kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user "${KEYCLOAK_USER}" --password ${KEYCLOAK_PASSWORD}

# Get management API access token (assuming it's Auth0)
tokenresponse=$(curl --request POST \
    --url "${AUTH0_BROKER_TOKEN_URL}" \
    --header "Content-Type: application/x-www-form-urlencoded" \
    --data "client_id=${AUTH0_BROKER_CLIENT_ID}" \
    --data "grant_type=client_credentials" \
    --data "client_secret=${AUTH0_BROKER_CLIENT_SECRET}" \
    --data "audience=${AUTH0_BROKER_MANAGEMENT_API_URL}" \
)

accesstoken=$(
    echo "${tokenresponse}" | grep -zoP '"access_token":\s*"\K[^\s,]*(?="\s*,)'
)
# 3 use user info to add user to keycloak
# 4 repeat from step 2

# Get users by email
file=${1:--}

# read line-by-line, no newline
while IFS= read -r line; do
    # lookup email using token
    userobj=$(
        curl --request GET \
            --url "${AUTH0_BROKER_MANAGEMENT_API_URL}users-by-email?email=${line}" \
            --header "Authorization: Bearer $accesstoken"
    )
    # extract user_id (remove "usr_" from beginning if it exists, put "auth0|" at beginning of id if it's not already there)
    userid=$(
        echo "$userobj" \
            | grep -oP '"user_id":\s*"\K[^\s,]*(?="\s*,)' \
            | head -n1 \
            | sed 's/^\(usr_\)\?\(auth0|\)\?/auth0|/g'
    )
    # try to add user to keycloak with this id
    printf "Adding user with email '%s' and id '%s'... " "$line" "$userid"
    set +e
    kcadm.sh create users -s username="$userid" -s email="$line" -s enabled=true -r "${KEYCLOAK_REALM}"
    if [[ $? -eq 0 ]]; then
        # kcadm.sh set-password -r "${KEYCLOAK_REALM}" --username "$newusername" --new-password "$newpassword" --temporary
        printf "User added successfully\n"
    else
        printf "Failed to add user\n"
    fi
    set -e
done < <(cat -- "$file")
