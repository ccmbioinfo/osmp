#! /usr/bin/env bash
#
# Add new users to osmp realm based on file of newline-separated emails.
# Each line must end with a newline.
set -euo pipefail

export PATH=$PATH:/opt/jboss/keycloak/bin
echo "$PATH"
kcadm.sh config credentials --server http://localhost:8080/auth --realm master --user "${KEYCLOAK_USER}" --password ${KEYCLOAK_PASSWORD}

echo "Reading $1..."
cat $1 | while read line; do
    # username is username section of email address (left of @)
    newusername="$line"
    newusername=${newusername%%@*}
    newpassword="$(openssl rand -hex 8)"
    kcadm.sh create users -s username="$newusername" -s enabled=true -r "${KEYCLOAK_REALM}"
    kcadm.sh set-password -r "${KEYCLOAK_REALM}" --username "$newusername" --new-password "$newpassword" --temporary
    printf "email: '%s', username: '%s', temp password: '%s'\n" "$line" "$newusername" "$newpassword"
done
