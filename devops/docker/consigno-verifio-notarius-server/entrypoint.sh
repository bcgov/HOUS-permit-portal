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

exec $CSA_HOME/jre/bin/java -DCSA_WEBSERVICES_ENABLED=true -Djava.library.path=$CSA_HOME/dll -Dfile.encoding=UTF-8 -Xmx1024m -cp $CSA_HOME/addons/*:$CSA_HOME/conf/:$CSA_HOME/sdk-components/*:$CSA_HOME/sdk-deps/* com.notarius.consigno.sdk.cli.Main -server /tmp