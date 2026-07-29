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

## First-time database setup (required after every fresh DB)

`helm install`/`helm upgrade` only creates the Kubernetes resources — it does **not**
create the Matomo database schema or the superuser account. The chart used to run
`./console plugin:activate ExtraTools && ./console matomo:install --install-file=...`
for this (see `matomo.installCommand` in `values.yaml`), but that command only works
on the old `digitalist/matomo` image, which bundled the paid **ExtraTools** plugin.
The vanilla `matomo:*-fpm` image used by `values-openshift*.yaml` does not include
ExtraTools, so that command fails with `Cannot find plugin files for ExtraTools.`
There is currently no automated replacement — complete Matomo's own web installer
once per database, using these steps:

1. Deploy the chart as usual and wait for `matomo-dashboard` to be `Running`.
2. Visit the dashboard URL (`matomo.dashboard.hostname`) in a browser.
   - If you see the **Installation** wizard (0% progress), just continue to step 3.
   - If you instead see `Error: Matomo is already installed. Original error was
     ...Table '...matomo_option' doesn't exist`, the pod's `config.ini.php`
     already has database credentials in it (written automatically on every pod
     start) but the schema was never created — usually because you pointed the
     chart at a database/PVC that was never installed through the wizard.
     Force the wizard to reappear by removing that file from the *running* pod
     (it will be regenerated on the next pod restart, so this is safe):
     ```bash
     oc exec -n <namespace> deploy/matomo-dashboard -c matomo -- \
       mv /var/www/html/config/config.ini.php /var/www/html/config/config.ini.php.bak
     ```
     Then reload the dashboard URL — it should show the Installation wizard again.
3. Walk through the wizard using the values already in your `-f` values file:
   - **Database Setup**: Server = `db.hostname`, Login = `db.username`,
     Password = the value in the `db.password.secretKeyRef.name` /
     `.key` Secret, Database Name = `db.name`, Table Prefix = `db.prefix`,
     Database Engine = MariaDB (if using the bundled StatefulSet).
   - **Superuser**: use `matomo.dashboard.firstuser.username` / `.password` / `.email`.
   - **Set up a Website**: use `matomo.site.name` / `matomo.site.url` and your timezone.
   - Skip the JavaScript tracking code step (already handled by the tracker deployment)
     and click through to **Congratulations**.
4. Once the wizard finishes, the schema exists in the database (which lives in the
   PVC, not in the pod), so this only needs to be done once per database — future
   pod restarts and `helm upgrade`s will connect to the already-installed schema
   without repeating the wizard.

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
