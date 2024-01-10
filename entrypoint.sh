#!/bin/bash

# -e          : causes script to fail if any command below has non-zero exit status
# -u          : a reference to any variable you haven't previously defined cause immediate exit
# -o pipefail : prevents errors in a pipeline from being masked. If any command in a pipeline fails, 
#               that return code will be used as the return code of the whole pipeline.
set -euo pipefail 

# shellcheck disable=SC1091

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

exec "$@"
