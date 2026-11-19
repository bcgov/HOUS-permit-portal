#!/bin/sh
# Run in the Redis 8 image with an unused destination volume and a verified RDB.
set -eu
umask 007
snapshot=${1:?provide an RDB snapshot path}
dest=${2:?provide an empty destination directory}
test -s "$snapshot" && test -d "$dest" || exit 1
# Some storage classes create lost+found at the volume root.
if [ -n "$(find "$dest" -mindepth 1 -maxdepth 1 ! -name lost+found -print -quit)" ]; then
  echo "Destination already contains data; use a fresh volume." >&2
  exit 1
fi
work=$(mktemp -d)
socket=$work/redis.sock
cli() { redis-cli -e -s "$socket" "$@"; }
redis-check-rdb "$snapshot" > "$work/check.log"
cp "$snapshot" "$dest/dump.rdb"
redis-server --port 0 --unixsocket "$socket" --dir "$dest" --save "" --appendonly no >"$work/server.log" 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true' EXIT
while ! cli ping >/dev/null 2>&1; do kill -0 "$server"; sleep 1; done
cli CONFIG SET appendonly yes
while :; do
  kill -0 "$server"
  info=$(cli INFO persistence | tr -d '\r')
  case "$info" in *aof_last_bgrewrite_status:err*|*aof_last_write_status:err*) exit 1 ;; esac
  if echo "$info" | grep -qx 'aof_enabled:1' &&
     echo "$info" | grep -qx 'aof_rewrite_in_progress:0' &&
     echo "$info" | grep -qx 'aof_rewrite_scheduled:0' &&
     echo "$info" | grep -qx 'aof_last_bgrewrite_status:ok' &&
     test -s "$dest/appendonlydir/appendonly.aof.manifest"; then break; fi
  sleep 1
done
cli SHUTDOWN NOSAVE
wait "$server"
trap - EXIT
# Redis creates its AOF directory with explicit modes. The StatefulSet may
# receive a different OpenShift UID and shares the PVC's group with this pod.
chmod g+rwx "$dest/appendonlydir"
chmod g+rw "$dest/dump.rdb" "$dest"/appendonlydir/*
echo "Redis 8 loaded the RDB and persisted its append-only file set."
