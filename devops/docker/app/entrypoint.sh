#!/bin/bash

# -e          : causes script to fail if any command below has non-zero exit status
# -u          : a reference to any variable you haven't previously defined cause immediate exit
# -o pipefail : prevents errors in a pipeline from being masked. If any command in a pipeline fails, 
#               that return code will be used as the return code of the whole pipeline.

# Increase file descriptor limit for Vite precompile later
ulimit -n 65536

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

# Rails Entrypoint
# If running the rails server then create or migrate existing database
if [ "${1}" == "./bin/rails" ] && [ "${2}" == "server" ]; then
  until nc -z -v -w30 ${DATABASE_OPENSHIFT_SERVICE_HOST} 5432; do
    echo "Waiting for PostgreSQL database (${DATABASE_OPENSHIFT_SERVICE_HOST}) to start..."
    sleep 1
  done

  echo "*** Preparing Database..."
  
  IS_DOCKER_BUILD=true ./bin/rails db:migrate
fi

exec "$@"
