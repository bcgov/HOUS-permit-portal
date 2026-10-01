# Matomo Database Backup & Restore (S3-compatible + PVC)

Scheduled backups of the Matomo MariaDB database to **two independent
destinations** — an on-premise S3-compatible bucket, and/or a
PersistentVolumeClaim in this namespace — plus a deliberately manual, guarded
restore procedure that can pull from **whichever destination is actually
available**. Modelled on the same shape as this project's `ha-postgres-crunchydb`
chart (endpoint/bucket/path/secret-name config, scheduled full backups,
count-based retention), but built for MariaDB, which has no single tool with
S3 support built in the way PostgreSQL's pgBackRest does.

Run one destination, or both — they don't depend on each other. If you enable
both, every scheduled run writes a copy to S3 *and* a copy to the PVC, each
with its own independent retention count, so a problem with one destination
(bucket unreachable, PVC full) never blocks the other from succeeding.

**Tooling used:** `mariadb-dump` for the database dump; [`rclone`](https://rclone.org/)
to move it to S3 (a vendor-neutral cloud-storage sync tool — S3-compatible is
just one of dozens of backends it can talk to via a plain endpoint URL, nothing
AWS-specific — no AWS CLI, no AWS-branded image, no AWS credentials); and plain
`cp`/`rm` for the PVC destination (it's just a file on a volume, no extra
tooling needed).

---

## 0. Sensitive data — read this first

**No real credentials are in any file in this repository.** Every S3
credential field in `values.yaml` defaults to an empty string, and the
recommended production path never puts a real value into a values file at
all. Places this matters:

| Field | Risk if misused | What to do instead |
|---|---|---|
| `backup.s3.accessKey` / `backup.s3.secretKey` | If you fill these into a values file and that file gets committed, the credential is now in git history permanently — deleting it later does not remove it from history. | Leave these blank. Set `backup.s3.createSecret: false` and create the Secret directly on the cluster (§2.2) — it never touches a file, and never a repo. |
| `restore.confirm` / `restore.enabled` | These gate a **destructive** action (overwrites the live database). If they're ever set to their trigger values in a *persisted* values file, a routine `helm upgrade` could re-run a restore without anyone intending it. | Never set these in `values.yaml` or any `values-*.yaml` you keep. Only ever pass them as one-off `--set` flags on the specific command you're running right now (§5). |
| Backup contents themselves | The `.sql.gz` files contain real visitor data (IPs, if not anonymized) and your Matomo superuser's password hash. Anyone with bucket read access can read this. | Restrict bucket/prefix access at the object-store level to only the service account this chart uses. Standard data-handling rules for your organization apply to backup files exactly as they do to the live database. |

If you already have real credentials in a values file from earlier
experimentation, rotate them at the source (create a new access key,
invalidate the old one) — don't just delete the line from a future commit.

---

## 1. How it works

- **Backup** (`templates/backup-cronjob.yaml`, `templates/backup-s3-secret.yaml`,
  `templates/backup-pvc.yaml`): a single `CronJob` on `backup.schedule`. An
  init container runs `mariadb-dump | gzip` once, to a shared `emptyDir`. Two
  independent, parallel containers then each take that one dump and send it
  to their own destination — enable either, both, or neither per environment:
  - **`upload`** (only rendered when `backup.s3.enabled`): pushes the file via
    `rclone` to `<bucket>/<path>/matomo-<UTC timestamp>.sql.gz`, then trims
    that folder down to `backup.retentionCount` files.
  - **`pvc-backup`** (only rendered when `backup.pvc.enabled`): copies the
    same file onto a PVC in this namespace at
    `<backup.pvc.mountPath>/matomo-<UTC timestamp>.sql.gz`, then trims that
    folder down to `backup.pvc.retentionCount` files — its own, separate
    count from the S3 side.
  - Both use the exact same filename format, so `latest`/named-file lookups
    at restore time work identically no matter which destination you're
    restoring from.
- **What the job will and won't touch (important for testing against
  storage you don't fully control):** every list/count/delete operation, on
  *either* destination, is restricted to files matching exactly
  `matomo-YYYYMMDD-HHMMSS.sql.gz`. Anything else already there — other
  prefixes, other apps' data, unrelated files on the PVC — is never listed,
  counted, or deleted; the job literally cannot see it as a deletion
  candidate. Backups only ever *add* one new file per destination per run;
  nothing is ever written anywhere else.
- **Bucket object-count limits (S3 only):** if your object store caps the
  total number of objects in the bucket (e.g. 500), set `backup.s3.maxObjects`
  to that number. Before every upload the job counts *all* objects in the
  whole bucket (not just its own), and if adding one more would exceed the
  limit it first prunes its own oldest backups to make room — and if that
  still isn't enough (because something else in the bucket is consuming the
  quota), it aborts **without uploading or deleting anything**, rather than
  guessing. Leaving `maxObjects: 0` (the default) skips this check entirely.
  See [§2.6](#26-testing-safely-in-dev-and-the-500-object-limit). The PVC
  destination has no equivalent shared-quota concern — it's a dedicated
  volume, sized by `backup.pvc.size`.
- **Restore** (`templates/restore-job.yaml`): a one-off `Job`, never a
  CronJob. `restore.source` (`"s3"` or `"pvc"`) picks which destination to
  restore *from* — use whichever one is actually intact/reachable right now.
  An init container finds and stages either a named backup or the most
  recent one (`restore.backupFile: latest`) from that source, then the main
  container pipes it into `mariadb` against the live database —
  **overwriting whatever is currently there**. Gated behind two separate
  flags (§5) so it can never fire by accident.
- MariaDB has no simple logical-incremental backup mechanism (unlike
  pgBackRest's full+incremental schedules), so every scheduled run is a full
  dump. For a database this size (see the earlier storage-management
  discussion — real analytics data is typically well under a few hundred MB),
  a full daily dump is cheap; retention by count keeps both destinations
  bounded.

---

## 2. Setup

### 2.1 Prerequisites

Only relevant if you're using the **S3** destination (skip if PVC-only):

- An on-premise S3-compatible bucket you have credentials for, and a
  folder/prefix within it to use (`backup.s3.path`, default `/matomo-backups`).
- The `rclone/rclone` image mirrored into your project's ImageStream, same
  pattern as every other image this chart uses:
  ```bash
  oc tag rclone/rclone:1.68.2 --source=docker rclone:1.68.2 -n <namespace>
  ```
  Note the destination has **no** `rclone/` prefix — a destination tag
  containing `/` gets parsed by `oc tag` as `<namespace>/<name>` and silently
  targets the wrong namespace instead of erroring (this chart's own
  `backup.s3ClientImage`/`restore.s3ClientImage` values are just `rclone:1.68.2`
  to match). Verify the pinned tag actually exists before importing — this
  chart already got burned once elsewhere by trusting a mistagged image
  without checking.

The **PVC** destination has no separate image to import — it reuses the same
MariaDB image already imported for the dump step (`backup.dbImage | default
db.image`), so there's nothing extra to mirror.

### 2.2 Create the S3 credentials Secret (recommended path — no file ever holds the real value)

```bash
oc create secret generic matomo-s3-backup \
  --from-literal=access-key='<your-access-key>' \
  --from-literal=secret-key='<your-secret-key>' \
  -n <namespace>
```

Then in your environment's values overlay, set `backup.s3.createSecret: false`
so the chart never tries to manage this Secret itself:

```yaml
backup:
  s3:
    createSecret: false
    secretName: "matomo-s3-backup"   # must match the Secret name above
```

(The chart-managed `createSecret: true` path exists only for quick local
testing against a throwaway/dev bucket — see the warning in §0.)

### 2.3 Enable the S3 backup destination

Add to your environment's values overlay (e.g. `values-openshift-<env>.yaml`)
— none of these fields are secrets, safe to commit:

```yaml
backup:
  enabled: true
  schedule: "0 2 * * *"        # daily at 02:00 UTC
  retentionCount: 14           # keep the last 14 backups on S3
  pruneEnabled: true           # false = upload-only, never delete anything
  s3:
    enabled: true
    createSecret: false
    secretName: "matomo-s3-backup"
    endpoint: "https://objectstore.example.gov.bc.ca"   # your on-prem endpoint
    bucket: "your-bucket-name"
    path: "/matomo-backups"
    maxObjects: 0                # e.g. 500 if your bucket enforces a hard cap
    insecure: false             # true only for a self-signed/internal-CA endpoint
```

Leave `backup.pvc.enabled` at its default `false` if you only want S3.

### 2.4 Enable the PVC backup destination

Independent of S3 — enable this alone, or alongside it. Add to the same
overlay:

```yaml
backup:
  enabled: true       # if not already set above
  pvc:
    enabled: true
    createClaim: true          # chart creates the PVC; false + existingClaim to reuse one
    size: "2Gi"                 # size for retentionCount backups + headroom (see §2.6)
    storageClass: ""            # empty = cluster default; e.g. "netapp-file-standard"
    accessMode: ReadWriteOnce
    retentionCount: 7           # independent of backup.retentionCount (S3's count)
    pruneEnabled: true
```

`storageClass: ""` uses whatever your namespace's default StorageClass is. On
this cluster that's typically `netapp-file-standard` (NFS-backed) — check
what your MariaDB PVC already uses with `oc get pvc -n <namespace>` if
unsure, and consider matching it.

Apply either (or both) sections:

```bash
helm upgrade matomo . -f values.yaml -f values-openshift.yaml -f values-openshift-<env>.yaml -n <namespace>
```

### 2.5 Verify it's actually running

Don't wait for the schedule — trigger one manually:

```bash
oc create job --from=cronjob/matomo-db-backup manual-backup-test -n <namespace>
oc get pods -n <namespace> -l job-name=manual-backup-test -w
```

Check whichever destination(s) you enabled — each is its own container in the
same pod:

```bash
oc logs -n <namespace> -l job-name=manual-backup-test -c upload       # S3 destination
oc logs -n <namespace> -l job-name=manual-backup-test -c pvc-backup   # PVC destination
```

**S3:** you should see `Upload complete.` and a retention summary. Confirm
the object actually landed:

```bash
oc run rclone-check --rm -it --restart=Never --image=<internal-registry>/<namespace>/rclone/rclone:1.68.2 \
  --overrides='{"spec":{"containers":[{"name":"rclone-check","image":"<internal-registry>/<namespace>/rclone/rclone:1.68.2","command":["sh"],"stdin":true,"tty":true,"env":[
    {"name":"RCLONE_CONFIG_S3REMOTE_TYPE","value":"s3"},
    {"name":"RCLONE_CONFIG_S3REMOTE_PROVIDER","value":"Other"},
    {"name":"RCLONE_CONFIG_S3REMOTE_ENV_AUTH","value":"false"},
    {"name":"RCLONE_CONFIG_S3REMOTE_ENDPOINT","value":"https://objectstore.example.gov.bc.ca"},
    {"name":"RCLONE_CONFIG_S3REMOTE_FORCE_PATH_STYLE","value":"true"},
    {"name":"RCLONE_CONFIG_S3REMOTE_ACCESS_KEY_ID","valueFrom":{"secretKeyRef":{"name":"matomo-s3-backup","key":"access-key"}}},
    {"name":"RCLONE_CONFIG_S3REMOTE_SECRET_ACCESS_KEY","valueFrom":{"secretKeyRef":{"name":"matomo-s3-backup","key":"secret-key"}}}
  ]}]}}' -- rclone lsf s3remote:your-bucket-name/matomo-backups/
```
(Or more simply: `oc exec` into any pod that already has the rclone image with these env vars set — e.g. the `matomo-db-backup` CronJob's own pod, right after a run, before it terminates — and run `rclone lsf ...` there.)

**PVC:** you should see `Copy complete:` and a retention summary. Confirm the
file actually landed:

```bash
oc run pvc-check --rm -it --restart=Never --image=<internal-registry>/<namespace>/matomo:5.12.0-fpm \
  --overrides='{"spec":{"containers":[{"name":"pvc-check","image":"<internal-registry>/<namespace>/matomo:5.12.0-fpm","command":["sh"],"stdin":true,"tty":true,"volumeMounts":[{"name":"b","mountPath":"/pvc-backups"}]}],"volumes":[{"name":"b","persistentVolumeClaim":{"claimName":"matomo-db-backup"}}]}}' \
  -- ls -la /pvc-backups
```

Clean up the test job:

```bash
oc delete job manual-backup-test -n <namespace>
```

---

### 2.6 Testing safely in dev, and the 500-object limit

Two questions to answer honestly before pointing this at a shared bucket:

**"Will this destroy or alter folders already in the bucket?"** No, by
construction: the job only ever lists/counts/deletes filenames matching
`matomo-YYYYMMDD-HHMMSS.sql.gz`, and only inside `backup.s3.path`. It cannot
delete a file it didn't create, and it never writes outside that one folder.
That said, for a first dev test, still be deliberate:

- Point `backup.s3.path` at a **brand-new folder that doesn't exist yet**,
  e.g. `/matomo-backups-dev`, not a folder that already holds other data.
  Nothing stops you reusing an existing folder — the pattern match protects
  its *contents* — but a fresh folder means you can visually confirm the
  bucket listing before/after with zero ambiguity.
- Set a low `retentionCount` (e.g. `3`) so a test loop doesn't accumulate
  objects.
- Run one manual test via `oc create job --from=cronjob/...` (§2.5) and
  inspect the `upload`/`pvc-backup` container's logs — every list/delete
  action is logged by filename — before trusting the schedule.
- If you want zero deletion risk for the very first run, set
  `backup.pruneEnabled: false` — the job will upload but never delete, so you
  can watch objects accumulate and enable pruning once you're satisfied.

**"The bucket has a 500-object limit — is that handled?"** Only if you tell
the chart about it — set `backup.s3.maxObjects: 500`. With that set, the job
counts the *entire bucket's* object total (everything, not just its own
folder) before every upload and refuses to push the count over the limit,
pruning its own oldest backups first if that's enough to make room, and
aborting cleanly (no upload, no delete) if it isn't. Left at the default `0`,
no such check happens — with `retentionCount: 14` that's at most 14 objects
from this job specifically, comfortably under 500 on its own, but:
- the limit may be shared with other data already in the bucket, which this
  job has no visibility into unless `maxObjects` is set;
- if you don't know whether the limit is per-bucket or per-prefix/folder,
  ask your object-store administrator — `maxObjects` as implemented here
  checks the whole bucket, which is the safer assumption if unsure.

**If you're testing the PVC destination:** the same "will it destroy
anything" question applies and has the same answer — pattern-restricted
deletion only ever touches `matomo-YYYYMMDD-HHMMSS.sql.gz` files under
`backup.pvc.mountPath`, and `backup.pvc.createClaim: true` provisions a
brand-new, empty PVC dedicated to this job, so there's nothing pre-existing
on it to begin with. There's no 500-object-style concern for a PVC — the only
limit is `backup.pvc.size` filling up, which shows as the `pvc-backup`
container failing with a disk-full error, not silent data loss. Size it
generously relative to `backup.pvc.retentionCount × your current backup size`
(measured directly against this database at the time of writing: a compressed
backup is under 1MB, so even `retentionCount: 7` fits in a fraction of the
default `2Gi` — re-measure as real traffic accumulates).

Recommended dev values, combining both destinations:

```yaml
backup:
  enabled: true
  retentionCount: 3
  pruneEnabled: true
  s3:
    enabled: true
    createSecret: false
    path: "/matomo-backups-dev"
    maxObjects: 500
  pvc:
    enabled: true
    createClaim: true
    size: "2Gi"
    retentionCount: 3
```

---

## 3. What to restore

First decide **which destination** to restore from — whichever is actually
available and intact right now (`restore.source: "s3"` or `"pvc"`, default
`"s3"`). Then decide **which backup** from that destination:

```bash
# S3 (requires an rclone-capable exec context, see §2.5)
rclone lsf s3remote:your-bucket-name/matomo-backups/ | sort

# PVC (requires a pod with the PVC mounted, see §2.5's pvc-check example)
ls /pvc-backups | sort
```

Filenames are `matomo-<UTC timestamp>.sql.gz`, e.g.
`matomo-20260915-020000.sql.gz` = the backup taken at 02:00 UTC on 2026-09-15.
Pick:

- **`latest`** (the default) — the most recent successful backup. Use this
  for disaster recovery after data loss/corruption where you just want the
  freshest possible state back.
- **A specific filename** — use this when you need to roll back to a point
  *before* a specific bad event (e.g. a botched migration, an accidental
  bulk delete, or before a Matomo version upgrade that went wrong — see
  `UPGRADE-AND-RESTORE-GUIDE.md` for the upgrade-specific version of this
  same concern). Pick the newest backup whose timestamp is *before* the
  event you're recovering from.

**A restore is a full-database replace, not a merge.** Anything written to
the database after the backup you choose (new visits, config changes, Tag
Manager edits) will be gone once the restore completes. If there's *any*
chance you'll want that data back, take a fresh backup first (§4, step 1)
before restoring over it.

---

## 4. How to restore

### Step 1 — Take a fresh backup first (safety net)

```bash
oc create job --from=cronjob/matomo-db-backup pre-restore-safety-backup -n <namespace>
oc wait --for=condition=complete job/pre-restore-safety-backup -n <namespace> --timeout=600s
oc delete job pre-restore-safety-backup -n <namespace>
```

This costs almost nothing and means "restoring the wrong backup" is always
recoverable.

### Step 2 — Stop traffic to the database

Restoring while the app is live and writing risks the restore and live
writes interleaving badly. Scale down the app pods and suspend the cron jobs:

```bash
oc scale deployment matomo-dashboard matomo-tracker --replicas=0 -n <namespace>
oc patch cronjob matomo-jobs-corearchive matomo-jobs-scheduled-tasks matomo-db-backup \
  -n <namespace> -p '{"spec":{"suspend":true}}' --type=merge
```

### Step 3 — Run the restore

This is the one command where you deliberately pass the destructive flags as
one-off `--set` overrides — **never put these in a values file**:

```bash
helm template matomo . -f values.yaml -f values-openshift.yaml -f values-openshift-<env>.yaml -n <namespace> \
  --set restore.enabled=true \
  --set restore.confirm=yes-overwrite-database \
  --set restore.source=s3 \
  --set restore.backupFile=latest \
  --set restore.jobSuffix=$(date +%s) \
  --show-only templates/restore-job.yaml | oc apply -f -
```

To restore from the **PVC** instead, the only change is `restore.source`:

```bash
helm template matomo . -f values.yaml -f values-openshift.yaml -f values-openshift-<env>.yaml -n <namespace> \
  --set restore.enabled=true \
  --set restore.confirm=yes-overwrite-database \
  --set restore.source=pvc \
  --set restore.backupFile=latest \
  --set restore.jobSuffix=$(date +%s) \
  --show-only templates/restore-job.yaml | oc apply -f -
```

Notes:
- `restore.source` picks the destination — use whichever one is actually
  available right now (e.g. S3 endpoint unreachable but the PVC is fine, or
  vice versa). Defaults to `"s3"` if omitted.
- `restore.backupFile=latest` restores the most recent backup **on the
  source you picked** — substitute the exact filename from §3 to restore a
  specific point in time instead (e.g.
  `--set restore.backupFile=matomo-20260910-020000.sql.gz`). Both
  destinations use identical filenames for the same run, so if both were
  enabled at backup time, the same filename exists on both.
- `restore.jobSuffix=$(date +%s)` gives the Job a fresh, unique name every
  time — Jobs are immutable once created, so reusing a name fails outright
  rather than silently doing nothing.
- Using `helm template | oc apply` here (instead of `helm upgrade`) is
  deliberate: it creates the one-off restore Job without touching the main
  Helm release's stored values at all, so there's no risk of these flags
  ever lingering into a future `helm upgrade`.

Watch it run:

```bash
oc get pods -n <namespace> -l app=matomo-db-restore -w
oc logs -n <namespace> -l app=matomo-db-restore -c download   # if restore.source=s3
oc logs -n <namespace> -l app=matomo-db-restore -c select     # if restore.source=pvc
oc logs -n <namespace> -l app=matomo-db-restore -c restore
```

You should see `Download complete: ...` (s3) or `Selected from PVC: ...` (pvc),
followed by `Restore complete.`

### Step 4 — Bring the app back up

```bash
oc scale deployment matomo-dashboard matomo-tracker --replicas=1 -n <namespace>
oc patch cronjob matomo-jobs-corearchive matomo-jobs-scheduled-tasks matomo-db-backup \
  -n <namespace> -p '{"spec":{"suspend":false}}' --type=merge
```

### Step 5 — Verify

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://<dashboard-hostname>/"
oc exec -n <namespace> <mariadb-pod> -- mariadb -uroot -p'<password>' matomo \
  -e "SELECT COUNT(*) FROM matomo_log_visit; SELECT MAX(visit_last_action_time) FROM matomo_log_visit;"
```

Confirm the row count and most-recent-visit timestamp match what you expect
from the backup you chose. Log into the dashboard and spot-check that sites,
users, and Tag Manager containers look right.

### Step 6 — Clean up the restore Job

```bash
oc delete job matomo-db-restore-<the-jobSuffix-you-used> -n <namespace>
```

---

## 5. Retention and monitoring

- Retention is enforced by the backup job itself, **separately per
  destination** — `backup.retentionCount` for S3, `backup.pvc.retentionCount`
  for the PVC — trimming oldest-first after every successful write, only ever
  among files matching this job's own naming pattern (§2.6). There's no
  separate bucket lifecycle policy required for S3, though one at the
  object-store level is a reasonable extra safety net if your platform
  supports it.
- If the bucket enforces a hard object-count cap, set `backup.s3.maxObjects`
  (§2.6) — otherwise this chart has no way to know about it and a backup run
  could fail once the bucket is full. The PVC destination just needs
  `backup.pvc.size` sized with headroom (§2.6) — there's no shared-quota
  equivalent to watch for there.
- A pod failure on one destination doesn't affect the other: `upload` and
  `pvc-backup` are separate containers in the same Job, each independently
  succeeds or fails. Check `oc get pods ... -o jsonpath` or the pod's
  `status.containerStatuses` if you need to know which one failed on a given
  run — or just check both sets of logs (§2.5).
- Nothing currently pages/alerts on a failed backup run — check periodically
  with:
  ```bash
  oc get jobs -n <namespace> -l app=matomo-db-backup
  ```
  A `Failed` status here means at least one destination failed that cycle
  (the whole Job fails if any container in it fails); investigate via
  `oc logs` on the failed job's pod, per-container as above, before the next
  scheduled run overwrites the failure history (bounded by
  `successfulJobsHistoryLimit`/`failedJobsHistoryLimit`, both default 3).

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `upload` container errors immediately, no `Uploading to ...` line | Bad endpoint/bucket/credentials | Double-check `backup.s3.endpoint`/`bucket` and that the Secret's `access-key`/`secret-key` are correct. |
| `x509: certificate signed by unknown authority` | On-prem endpoint uses a self-signed/internal CA | Set `backup.s3.insecure: true` (and `restore.s3.insecure` if restoring from the same endpoint). |
| Restore job never renders (`oc apply` says nothing to apply) | `restore.confirm` doesn't exactly match `yes-overwrite-database`, or `restore.enabled` wasn't set | Both are required together — this is deliberate (§0). Re-check the exact `--set` flags. |
| `ERROR: bucket would still exceed maxObjects=... even after deleting all ... of our own backups` | Other data in the bucket (outside `backup.s3.path`) is already near/over the cap you set | Raise `maxObjects` if it's actually higher, free space at the object-store level, or point `backup.s3.path`/bucket at somewhere with headroom. Nothing was uploaded or deleted — safe to just fix and retry. |
| `ERROR: backup.s3.path must be a dedicated folder, not the bucket root` | `backup.s3.path` was left empty or set to `/` | Set it to an actual folder name, e.g. `/matomo-backups`. |
| `no backup found under ...` (S3) / `no backup found on PVC at ...` | Wrong `backup.s3.path`/`bucket`/`restore.source`, or genuinely no backups exist yet on that destination | List the source directly (§2.5 / §3) to confirm what's actually there — and double-check `restore.source` matches the destination you actually have backups on. |
| `pvc-backup` container errors, `No space left on device` | `backup.pvc.size` too small for `backup.pvc.retentionCount` backups | Either raise `backup.pvc.size` (requires the PVC's StorageClass to support volume expansion, or delete and recreate the PVC) or lower `backup.pvc.retentionCount`. |
| Restore `select` initContainer can't mount the PVC / stays `ContainerCreating` | The PVC's StorageClass is `ReadWriteOnce` and something else has it mounted read-write on a different node at the same moment (e.g. a backup CronJob run overlapping the restore) | Wait for the other pod to release it, or re-run once the backup Job has completed. If this happens often, check whether your StorageClass supports `ReadWriteMany` (`backup.pvc.accessMode`) to remove the conflict entirely. |
| Restore `Job` name conflict / immutable field error | Reused the same `restore.jobSuffix` as a previous attempt | Use a fresh value, e.g. `$(date +%s)`, every time. |
