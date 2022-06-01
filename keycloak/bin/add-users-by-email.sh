#! /usr/bin/env bash
#
# Add new users to osmp realm based on file of newline-separated emails.
# Each line must end with a newline.

# Example usage with Docker:
# cat emails.txt | docker exec -i <keycloak_container> bash /usr/local/bin/add-users-by-email.sh

set -euo pipefail

export PATH=$PATH:/opt/jboss/keycloak/bin
kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user "${KEYCLOAK_USER}" --password ${KEYCLOAK_PASSWORD}

file=${1:--}

while IFS= read -r line; do
    # username is username section of email address (left of @)
    newusername="$line"
    newusername=${newusername%%@*}
    newpassword="$(openssl rand -hex 8)"
    # try to make a new user
    printf "Adding user with email '%s'...\n" "$line"
    set +e
    kcadm.sh create users -s username="$newusername" -s email="$line" -s enabled=true -r "${KEYCLOAK_REALM}"
    if [[ $? -eq 0 ]]; then
        kcadm.sh set-password -r "${KEYCLOAK_REALM}" --username "$newusername" --new-password "$newpassword" --temporary
        printf "User '%s' added successfully; temp password: '%s'\n" "$newusername" "$newpassword"
    fi
    set -e
done < <(cat -- "$file")
