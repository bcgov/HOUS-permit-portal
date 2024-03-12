# DevOps

The application relies on various deployments and services in order to run. These are all deployed into the government's Openshift environment.

## Helm Charts

There are helm charts available for each major service / application. Right now they are:

- permit-portal-routing (includes base network policies and nginx for reverse proxying to websocket / http servers)
- app (includes web, workers, RPC service for hous-permit-portal)
- anycable-go (websocket service)
- ha-postgres-crunchydb (HA Postgres, makes use of https://github.com/bcgov/crunchy-postgres)
- ha-elasticsearch (HA Elasticsearch based off bitnami/elasticsearch)
- ha-redis (HA Redis with Sentinels based off bitnami/redis)

Run each helm chart by going into the respective folder and issuing helm commands, here are some examples:

Install Helm Chart (dry run)
`helm install hous-permit-portal . -f values.yaml -f values-dev.yaml -n bb18ab-dev --debug --dry-run`

Make updates to the Helm release
`helm upgrade hous-permit-portal -f values.yaml -f values-dev.yaml -n bb18ab-dev`
