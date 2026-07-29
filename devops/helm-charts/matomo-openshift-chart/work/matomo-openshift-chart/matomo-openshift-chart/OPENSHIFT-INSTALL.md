# Matomo Helm install on OpenShift

This chart is based on the uploaded Matomo Kubernetes chart and adds the missing install-time pieces:

- optional bundled MariaDB StatefulSet, Service, PVC, and generated root password Secret
- configurable images for Matomo, nginx, php-fpm exporter, and MariaDB
- optional OpenShift Routes for dashboard and tracker
- optional `runAsUser` values so the chart can run with OpenShift restricted SCCs

## Mirror or import images

The example override file expects these internal registry images:

```bash
image-registry.openshift-image-registry.svc:5000/matomo/matomo:5.7.1
image-registry.openshift-image-registry.svc:5000/matomo/nginx:1.21.6
image-registry.openshift-image-registry.svc:5000/matomo/php-fpm_exporter:2.2.0
image-registry.openshift-image-registry.svc:5000/matomo/mariadb:11.4
```

You can change `global.imageRegistry` and the image names in `values-openshift.yaml` to match your OpenShift project and ImageStreams.

## Install

```bash
oc new-project matomo
helm install matomo ./matomo -n matomo --create-namespace -f values-openshift.yaml
```

If you install from the packaged archive:

```bash
helm install matomo matomo-11.0.65.tgz -n matomo --create-namespace -f values-openshift.yaml
```

Before installing, update:

- `matomo.dashboard.hostname`
- `matomo.tracker.hostname`
- `matomo.dashboard.firstuser.password`
- `global.imageRegistry`

## External database

To use an existing database instead of the bundled MariaDB:

```yaml
db:
  enabled: false
  hostname: your-db-service
  name: matomo
  username: root
  password:
    secretKeyRef:
      name: your-existing-secret
      key: mysql-root-password
```
`NOTES`
```

docker login -u $(oc whoami) -p $(oc whoami -t) image-registry.apps.silver.devops.gov.bc.ca

docker pull digitalist/matomo:5.7.1
docker pull digitalist/nginx:1.21.6
docker pull hipages/php-fpm_exporter:2.2.0
docker pull mariadb:11.4

docker tag digitalist/matomo:5.7.1 image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/matomo:5.7.1
docker tag digitalist/nginx:1.21.6 image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/nginx:1.21.6
docker tag hipages/php-fpm_exporter:2.2.0 image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/php-fpm_exporter:2.2.0
docker tag mariadb:11.4 image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/mariadb:11.4


docker push image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/matomo:5.7.1
docker push image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/nginx:1.21.6
docker push image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/php-fpm_exporter:2.2.0
docker push image-registry.apps.silver.devops.gov.bc.ca/bb18ab-tools/mariadb:11.4

helm install matomo . -n bb18ab-tools -f values-openshift.yaml
helm install matomo . -n bb18ab-tools -f values-openshift.yaml --debug --dry-run=server

helm install matomo . -n bb18ab-tools -f values-openshift.yaml --debug --dry-run



DB:

 oc exec -it matomo-db-mysql-0 -it -- bash
mariadb -h matomo-db-mysql -P 3306 -u root -p p3v0H0xkJMcsPMeeyRlchqGzIkh6RRU4

USE matomo;

INSERT INTO matomo_site (name, main_url, timezone, currency, sitesearch_keyword_parameters, sitesearch_category_parameters, excluded_ips, excluded_parameters, excluded_user_agents, excluded_referrers, `group`, type) 
VALUES ('Default Site', 'https://dev.buildingpermit.gov.bc.ca', 'UTC', 'CAD', '', '', '', '', '', '', 'default', 'website');

UPDATE matomo_site SET ts_created = NOW() WHERE idsite = 1;
```
```
To activate Tag manager in the matomo container

/var/www/html 

./console plugin:activate TagManager

./console core:update
```