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
