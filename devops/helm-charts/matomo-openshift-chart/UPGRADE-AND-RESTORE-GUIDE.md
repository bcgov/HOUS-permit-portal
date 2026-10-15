# Matomo — Image Upgrade & Restore Procedure

Covers how to upgrade to a newer `matomo:*-fpm` image without disturbing existing UI configuration (Tag Manager containers, users, sites, settings) or analytics data in the database, and how to fully restore if the upgrade goes wrong.

**Core principle:** all persistent state (websites, users, Tag Manager containers/tags/variables, visit logs, settings) lives in the MariaDB database on its own PVC — completely decoupled from which image the app pods run. An image swap alone never touches this data. The only operation that *does* mutate the database is the schema migration step (`core:update`), so that's the one step this whole procedure is built around.

---

## 1. Before you start

- Confirm current state:
  ```bash
  oc exec -n <namespace> deploy/matomo-dashboard -c matomo -- sh -c "cd /var/www/html && ./console core:version"
  helm history matomo -n <namespace>
  ```
  Note the current image tag and the current Helm revision number — this is your rollback target.

- **Back up the database.** Use `--add-drop-table` so the dump can cleanly overwrite existing tables on restore:
  ```bash
  oc exec -n <namespace> matomo-db-mysql-0 -- \
    mariadb-dump -uroot -p'<password>' --add-drop-table --routines --triggers matomo \
    > matomo-backup-$(date +%Y%m%d-%H%M).sql
  ```
  Verify the dump isn't empty/truncated:
  ```bash
  grep -c "^INSERT INTO" matomo-backup-*.sql
  ```

- Optional extra safety net if your cluster's storage class supports it (check `oc get volumesnapshotclass`): take a CSI VolumeSnapshot of the MariaDB PVC too. Faster to restore than a SQL dump for large databases, but the SQL dump is the primary, guaranteed-portable method this guide relies on.

---

## 2. Upgrade steps

1. **Import and sanity-check the new image tag before rolling it out.** Don't trust the tag name alone — we were once burned by a Docker Hub tag (`5.11.2-fpm`) that actually contained different code than its name claimed.
   ```bash
   oc tag matomo:<newversion>-fpm --source=docker matomo:<newversion>-fpm -n <namespace>
   oc run matomo-version-check --rm -it --restart=Never \
     --image=<internal-registry>/<namespace>/matomo:<newversion>-fpm \
     -- grep "VERSION = " core/Version.php
   ```
   Confirm the printed version matches what you intended to pull.

2. **Bump the version** in your environment's values overlay:
   ```yaml
   matomo:
     image: matomo:<newversion>-fpm
   ```

3. **Deploy:**
   ```bash
   helm upgrade matomo . -f values.yaml -f values-openshift.yaml -f values-openshift-<env>.yaml -n <namespace>
   ```
   With `strategy: Recreate` already set on the dashboard/tracker Deployments, expect a short full outage while old pods terminate and new ones start on the new image — this is normal for a controlled upgrade window, not a failure.

4. **Run the schema migration once — mandatory, not optional:**
   ```bash
   oc exec -n <namespace> deploy/matomo-dashboard -c matomo -- sh -c "cd /var/www/html && ./console core:update --yes"
   ```
   This only needs to run once from any single pod — `version_core` and `version_<Plugin>` are global rows in the `matomo_option` table, not per-pod state. It updates schema/version bookkeeping only; it does not touch your websites, users, Tag Manager containers, or logged visits.

5. **Check for newly-bundled plugins.** If the new release ships a plugin that didn't exist before, add it to the `[Plugins]`/`[PluginsInstalled]` lists in `templates/_helpers.tpl` (`matomo.commonConfigIni`) — that list is hardcoded rather than derived dynamically, a deliberate fix for a prior bug where missing entries silently disabled tracking. Existing plugins are unaffected either way; this only matters for genuinely new ones.

---

## 3. Verify

```bash
oc exec -n <namespace> deploy/matomo-dashboard -c matomo -- sh -c "cd /var/www/html && ./console core:version"
```
Then:
- Load the dashboard, confirm login and admin screens work.
- Spot-check Tag Manager → your container still lists its Tags/Triggers/Variables as before.
- Spot-check Administration → Websites / Users still show your existing entries.
- Re-run the tracking smoke test and confirm a new visit lands:
  ```bash
  curl -s -X POST "https://<tracker-hostname>/matomo.php?idsite=1&rec=1&action_name=UpgradeSmokeTest&url=https://example.com/upgrade-smoke-test&_id=abcdefabcdefabcd" \
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    -o /dev/null -w "Status: %{http_code}\n"
  oc exec -n <namespace> matomo-db-mysql-0 -- mariadb -uroot -p'<password>' matomo -e "SELECT COUNT(*) FROM matomo_log_visit;"
  ```

If everything above checks out, the upgrade is complete and the pre-upgrade backup can be retained per your normal retention policy (don't delete it immediately — keep it until you're confident the new version is stable under real traffic for a few days).

---

## 4. If the upgrade fails: which restore path applies

The correct recovery depends on **whether `core:update` actually ran to completion**, because that determines whether the database schema has already moved forward.

```bash
oc exec -n <namespace> deploy/matomo-dashboard -c matomo -- sh -c \
  "cd /var/www/html && ./console core:version"
oc exec -n <namespace> matomo-db-mysql-0 -- mariadb -uroot -p'<password>' matomo \
  -e "SELECT option_value FROM matomo_option WHERE option_name='version_core';"
```

- **Path A — Codebase version and `version_core` still match the OLD version** (pods failed to start, or `core:update` errored out before committing anything): the database was never touched. Go to §5A — you only need to revert the image.
- **Path B — `version_core` now shows the NEW version, but the app is broken/misbehaving for other reasons** (a bug in the new release, a missing plugin config, etc.): the schema has already moved forward. Running the *old* codebase against this newer schema recreates the exact codebase/database version-mismatch class of failure this chart hit before. Go to §5B — you need to restore the database, not just the image.

When in doubt, treat it as Path B — it's the safe default and never destroys anything that a Path A recovery wouldn't have kept anyway.

---

## 5A. Restore — image revert only (DB was never touched)

1. Revert the image tag in your values overlay back to the previous known-good tag, then:
   ```bash
   helm upgrade matomo . -f values.yaml -f values-openshift.yaml -f values-openshift-<env>.yaml -n <namespace>
   ```
   or, equivalently, roll back the whole release to the previous revision noted in §1:
   ```bash
   helm rollback matomo <previous-revision-number> -n <namespace>
   ```
2. Verify pods come up healthy and `core:version` matches the old version again.
3. Re-run the smoke test from §3.

## 5B. Restore — full database restore + image revert

1. **Scale down the app pods first** so nothing writes to the database mid-restore:
   ```bash
   oc scale deployment matomo-dashboard matomo-tracker matomo-cli --replicas=0 -n <namespace>
   oc get cronjob -n <namespace> -o name | xargs -I{} oc patch {} -n <namespace> -p '{"spec":{"suspend":true}}' --type=merge
   ```

2. **Restore the database from the pre-upgrade dump.** Since it was taken with `--add-drop-table`, this cleanly overwrites the mutated schema:
   ```bash
   cat matomo-backup-<timestamp>.sql | oc exec -i -n <namespace> matomo-db-mysql-0 -- \
     mariadb -uroot -p'<password>' matomo
   ```

3. **Revert the image tag** in your values overlay back to the version the backup was taken against, then redeploy:
   ```bash
   helm upgrade matomo . -f values.yaml -f values-openshift.yaml -f values-openshift-<env>.yaml -n <namespace>
   ```
   (This also un-suspends the cron jobs and scales the deployments back up, since `helm upgrade` reasserts the chart's declared replica counts and cron `suspend: false` state.)

4. **Verify** — `core:version` should now match `version_core` again (both back at the old version), dashboard loads, Tag Manager/users/sites intact, smoke test records a visit.

5. If cron jobs didn't automatically un-suspend, unsuspend them explicitly:
   ```bash
   oc patch cronjob matomo-jobs-corearchive matomo-jobs-scheduled-tasks -n <namespace> -p '{"spec":{"suspend":false}}' --type=merge
   ```

---

## 6. Quick reference

| Check | Command |
|---|---|
| Current codebase version | `./console core:version` (inside `matomo` container) |
| Current DB schema version | `SELECT option_value FROM matomo_option WHERE option_name='version_core';` |
| Helm revision history | `helm history matomo -n <namespace>` |
| Roll back Helm release | `helm rollback matomo <revision> -n <namespace>` |
| Dump DB | `mariadb-dump -uroot -p'<pw>' --add-drop-table --routines --triggers matomo > backup.sql` |
| Restore DB | `cat backup.sql \| oc exec -i ... -- mariadb -uroot -p'<pw>' matomo` |
| Suspend a cron job | `oc patch cronjob <name> -p '{"spec":{"suspend":true}}' --type=merge` |
