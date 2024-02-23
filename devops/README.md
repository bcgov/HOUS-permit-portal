# DevOps

The application relies on various deployments and services in order to run. These are all deployed into the government's Openshift environment.

## Helm Charts

There are helm charts available for each major service / application. Right now they are:

- App (includes web, workers, etc.)
- Crunchy Postgres (used for production HA PG - uses: https://github.com/bcgov/crunchy-postgres v0.6.0)

Run each helm chart by going into the respective folder and issuing helm commands, here are some examples:

Install Helm Chart (dry run)
`helm install hous-permit-portal . -f values.yaml -f values-dev.yaml -n bb18ab-dev --debug --dry-run`

Make updates to the Helm release
`helm upgrade hous-permit-portal -f values.yaml -f values-dev.yaml -n bb18ab-dev`
