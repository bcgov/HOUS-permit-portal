# Matomo Helm Chart — Fixes Applied & Deployment Guide

This document covers everything fixed in the chart during the `bb18ab-tools` deployment session, and the exact pre-install / post-install steps needed to get a fully working Matomo (dashboard + tracker + purge + Tag Manager) running in a **new** environment.

---

## 1. Fixes applied to the chart (permanent, apply to every future install)

| # | Issue | Symptom | Fix | File(s) |
|---|-------|---------|-----|---------|
| 1 | `.Values.namespace` used instead of `.Release.Namespace` | `helm install -n X` deployed resources into the wrong namespace (`matomo` instead of `X`), causing an RBAC `lookup` error on `db-secret.yaml` | Replaced all 30 occurrences with `.Release.Namespace`; removed the now-dead `namespace:` key from every values file | `templates/*.yaml` (all), `values.yaml`, `values-openshift*.yaml` |
| 2 | Cron job pods carried no `app` label | `matomo-jobs-corearchive` / `matomo-jobs-scheduled-tasks` pods got silently blocked from reaching MariaDB whenever `networkPolicy.enabled: true`, since the DB NetworkPolicy's allow-list only matched dashboard/tracker/cli/queuedtracking pods | Added `app: matomo-jobs-corearchive` / `app: matomo-jobs-scheduled-tasks` pod labels; added matching entries to the DB NetworkPolicy's ingress allow-list | `templates/cronjob-matomo-corearchive.yaml`, `templates/cronjob-matomo-scheduled-tasks.yaml`, `templates/networkpolicy.yaml` |
| 3 | Cron job memory requests too large for small quotas | `values-openshift.yaml`'s 512Mi `requests.memory` per cron job didn't fit inside `bb18ab-tools`' 2Gi `compute-long-running-quota` (already ~1.25–1.8Gi committed to always-on pods), so job pods sat in `BackoffLimitExceeded` | Lowered to `256Mi` requests / `1Gi` limits in the environment-specific overlay (only requests count against ResourceQuota, so limits can stay generous) | `values-openshift-bb18ab.yaml` |
| 4 | Dashboard/tracker Deployments used default `RollingUpdate` | With `replicas: 1`, every future deploy needed brief surge capacity the quota couldn't spare — deploys got stuck requiring manual cleanup | Set `strategy: {type: Recreate}` on both Deployments (no HA downside at replicas=1) | `templates/deployment-matomo-dashboard.yaml`, `templates/deployment-matomo-tracker.yaml` |
| 5 | `matomo:5.11.2-fpm` Docker Hub tag is mistagged | Codebase self-identified as 5.11.2 (installer, page titles) but `core/Version.php` and `core:version` actually reported `5.12.0` — Matomo's own front controller then refused every request with a codebase/DB version-mismatch error | Imported the correctly-labeled `matomo:5.12.0-fpm` tag and pointed `matomo.image` at it | `values-openshift-bb18ab.yaml` (image import done via `oc tag` on-cluster) |
| 6 | **`[Plugins]` / `[PluginsInstalled]` never shared across pods (the big one)** | Tracker requests returned clean `200`/`204`, but **no visit was ever recorded**, no matter how correct the JS/Tag Manager config was | Matomo's install wizard writes `[Plugins]`/`[PluginsInstalled]` back to the pod's **local** `config.ini.php` — but every pod has its own `emptyDir` webroot, and the chart's init container only ever wrote `[database]`/`[General]`. Without `[PluginsInstalled]`, `Plugin\Manager::isPluginInstalled()` returns false for everything, so `Tracker::loadTrackerPlugins()` excludes **every plugin including `CoreHome`** — the plugin that actually inserts rows into `log_visit`. Added the full `[Plugins]`/`[PluginsInstalled]` lists to the **shared** `common.config.ini.php` template (mounted read-only into every pod: dashboard, tracker, cli, both cron jobs) | `templates/_helpers.tpl` (`matomo.commonConfigIni`) |
| 7 | No `proxy_ips[]` configured | Matomo couldn't determine whether to trust `X-Forwarded-For` from the OpenShift Router, contributing to incorrect visitor IP resolution | Added `proxy_ips[]` for the standard private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) to the same shared config | `templates/_helpers.tpl` |
| 8 | Stale/misleading docs for the install command | `matomo.installCommand`'s documented default (`./console plugin:activate ExtraTools && ./console matomo:install ...`) only works on the old `digitalist/matomo` image (which bundled the paid ExtraTools plugin) — fails outright on the vanilla `matomo:*-fpm` image this chart now uses | Rewrote the comment/README row and added a full manual-install runbook | `values.yaml`, `README.md`, `OPENSHIFT-INSTALL.md` |

**Cluster-specific fixes (not chart bugs — only relevant if reusing an existing PVC with pre-existing data, as was the case in `bb18ab-tools`):**
- Patched the `matomo-db-mysql` Secret to the password already baked into the reused MariaDB PVC (a fresh Helm install randomizes a new password when no prior Secret exists to recover from, which won't match old data already on disk).
- Manually completed Matomo's web Installation wizard once, since the DB schema never existed on that particular reused PVC.
- Manually corrected the Tag Manager "Matomo Configuration" variable's **Matomo URL** to point at the tracker route instead of the dashboard route (the dashboard's nginx intentionally 403s `matomo.php`/`matomo.js` — only the tracker route serves them), then published the container to Live.

---

## 2. Pre-install checklist (new environment)

1. **Check the target namespace's ResourceQuota first**, before touching values:
   ```bash
   oc describe resourcequota -n <namespace>
   ```
   Note the `requests.memory` / `requests.cpu` hard limits. Size `defaultResources`, `matomo.resources`, and both `matomo.cronJobs.*.resources` to comfortably fit — remember only **requests** count against quota, limits don't.

2. **Mirror/import required images** into the project's internal ImageStream (adjust registry/project name):
   ```bash
   oc tag matomo:5.12.0-fpm               --source=docker matomo:5.12.0-fpm      -n <namespace>
   oc tag nginx:1.21.6                    --source=docker nginx:1.21.6           -n <namespace>
   oc tag hipages/php-fpm_exporter:2.2.0  --source=docker php-fpm_exporter:2.2.0 -n <namespace>
   oc tag mariadb:11.4                    --source=docker mariadb:11.4           -n <namespace>   # only if using the bundled DB
   oc tag rclone/rclone:1.68.2            --source=docker rclone:1.68.2          -n <namespace>   # only if using S3 backup/restore
   ```
   Note the asymmetry on `php-fpm_exporter` and `rclone`: the **source** (left
   of `--source=docker`) needs the Docker Hub org prefix (`hipages/`, `rclone/`)
   since these aren't official images, but the **destination** (local
   ImageStream tag) must NOT have it — a destination containing `/` gets
   parsed by `oc tag` as `<namespace>/<name>` and silently targets the wrong
   namespace/imagestream instead of erroring.
   ⚠️ Do **not** use `matomo:5.11.2-fpm` — that Docker Hub tag is mistagged and actually contains 5.12.0 code, which will break with a codebase/DB version-mismatch error. Use `5.12.0-fpm` (or whichever tag you've independently verified is self-consistent).

3. **Create a new environment overlay** `values-openshift-<env>.yaml`, following the pattern of `values-openshift-bb18ab.yaml`:
   - `global.imageRegistry` → the new project's internal registry path
   - `matomo.dashboard.hostname` / `matomo.tracker.hostname` → the two Route hostnames
   - `matomo.dashboard.firstuser.username` / `.password` / `.email`
   - `matomo.site.name` / `matomo.site.url`
   - `db.storage.size` sized for expected traffic (see the "small/medium/large" profile notes in `values.yaml`)
   - `defaultResources` and `matomo.cronJobs.coreArchive.resources` / `matomo.cronJobs.scheduledTasks.resources`, sized per step 1
   - Leave `matomo.cronJobs.coreArchive.enabled` and `matomo.cronJobs.scheduledTasks.enabled` at `true` — these run archiving and the PrivacyManager log purge; disabling them lets the DB grow unbounded
   - **Do not** add a `namespace:` key — it's unused now; the chart always deploys to wherever `-n`/`--namespace` points

4. Decide `matomo.privacy.deleteLogs.olderThanDays` / `deleteReports.olderThanMonths` up front based on expected data volume vs. `db.storage.size`.

---

## 3. Install

```bash
helm upgrade --install matomo . \
  -f values.yaml \
  -f values-openshift.yaml \
  -f values-openshift-<env>.yaml \
  -n <namespace>
```

Confirm before running: `helm lint` and `helm template ... | less` to eyeball the rendered manifests, especially namespace and image references.

---

## 4. Post-install (required manual steps — cannot be automated on this image)

### 4.1 Wait for the dashboard pod
```bash
oc get pods -n <namespace> -l app=matomo-dashboard -w
```

### 4.2 Complete the Matomo Installation wizard
The vanilla `matomo:*-fpm` image has no `ExtraTools` plugin, so there is no automated schema installer. Visit the dashboard URL — you should land on Matomo's own **Installation** wizard (System Check → Database Setup → Creating the Tables → Superuser → Set up a Website → JavaScript Tracking Code → Congratulations). Use:
- Database Setup: `db.hostname` / `db.username` / the password in the `db.password.secretKeyRef` Secret / `db.name` / `db.prefix`
- Superuser: `matomo.dashboard.firstuser.*`
- Website: `matomo.site.*`

If instead you see `Error: Matomo is already installed... Table '...matomo_option' doesn't exist` (this happens when reusing an old PVC whose data predates this chart, or whose Secret got regenerated), force the wizard to reappear:
```bash
oc exec -n <namespace> deploy/matomo-dashboard -c matomo -- \
  mv /var/www/html/config/config.ini.php /var/www/html/config/config.ini.php.bak
```
then reload the dashboard URL.

### 4.3 If using Matomo Tag Manager
The default Tag Manager container's **"Matomo Configuration"** variable defaults its **Matomo URL** to the dashboard hostname. The dashboard's nginx intentionally blocks `matomo.php`/`matomo.js` with a 403 (only the tracker route serves them). You must:
1. Dashboard → Tag Manager → your container → **Variables** → edit **Matomo Configuration** → set **Matomo URL** to `//<your-tracker-hostname>` (not the dashboard hostname).
2. **Publish** the container to the **Live** environment (editing the variable alone only updates the draft — nothing changes for real visitors until you publish).

### 4.4 Smoke-test tracking end-to-end
```bash
curl -s -X POST "https://<tracker-hostname>/matomo.php?idsite=1&rec=1&action_name=SmokeTest&url=https://example.com/smoke-test&_id=0000000000000000" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -o /dev/null -w "Status: %{http_code}\n"
```
Then confirm a row actually landed (a `200`/`204` alone does **not** prove the visit was recorded):
```bash
oc exec -n <namespace> <mariadb-pod> -- mariadb -uroot -p'<password>' matomo \
  -e "SELECT COUNT(*) FROM matomo_log_visit;"
```
If this is a genuinely fresh PVC (no reused data), fix #6 above means this should just work with zero manual intervention.

### 4.5 Verify the cron jobs actually run
```bash
oc create job --from=cronjob/matomo-jobs-corearchive manual-corearchive-test -n <namespace>
oc create job --from=cronjob/matomo-jobs-scheduled-tasks manual-scheduledtasks-test -n <namespace>
oc get jobs -n <namespace>
```
Both should reach `Complete` within a couple minutes. Check `oc logs` on the job pod if either fails — most likely causes are a quota mismatch (revisit step 1) or a NetworkPolicy gap (revisit fix #2 if you've customized the chart's labels/policies further).

Clean up test jobs afterward:
```bash
oc delete job manual-corearchive-test manual-scheduledtasks-test -n <namespace>
```

### 4.6 Confirm job history stays capped
Both cron jobs are set to `successfulJobsHistoryLimit: 3` / `failedJobsHistoryLimit: 3` — Kubernetes prunes older completed/failed Job objects automatically. No action needed; just confirm with:
```bash
oc get jobs -n <namespace>
```

---

## 5. Quick reference — what NOT to do

- Don't set `matomo.cronJobs.*.enabled: false` "temporarily" and forget about it — that's what silently let the DB grow unbounded in `bb18ab-tools` originally.
- Don't reuse an old PVC without also checking whether its baked-in DB password matches the Secret Helm will generate — it won't, unless the old Secret survived too.
- Don't trust a `200`/`204` from `matomo.php` as proof tracking works — always verify a row actually landed in `matomo_log_visit`.
- Don't point Tag Manager's "Matomo URL" at the dashboard hostname.
