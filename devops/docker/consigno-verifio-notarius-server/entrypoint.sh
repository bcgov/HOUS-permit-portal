#!/bin/bash

set -euo pipefail 

VAULT_SECRETS_DIR=/vault/secrets

if [ -d ${VAULT_SECRETS_DIR} ]; then
  set -a # enable mark variables which are modified or created for export
  for i in ${VAULT_SECRETS_DIR}/*.env; do
    echo "[entrypoint] Adding environment variables from ${i}"
    source ${i}
  done
  set +a # disable mark variables which are modified or created for export
else
  echo "[entrypoint] Vault secrets directory (${VAULT_SECRETS_DIR}) does not exist"
fi

# exec "$@"
csa-service start

# Prevent the openshift container from "Completing"
tail -f /dev/null