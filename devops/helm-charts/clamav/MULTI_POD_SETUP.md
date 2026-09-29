# ClamAV Multi-Pod Setup with Session Affinity

## Overview

This guide explains how to scale ClamAV to multiple pods with session affinity, ensuring optimal performance when multiple clients connect simultaneously.

---

## Session Affinity Explained

**Session Affinity (ClientIP):** Ensures that all requests from the same client IP go to the same ClamAV pod.

**Why This Matters:**
- ClamAV maintains connection state per pod
- Same client always talks to same pod = consistent behavior
- Prevents connection pooling issues across pods
- Reduces latency (no pod switching)

**How It Works:**
```
Client 1 (IP: 10.97.1.5) --> Always goes to Pod A
Client 2 (IP: 10.97.2.10) --> Always goes to Pod B
Client 3 (IP: 10.97.3.15) --> Always goes to Pod C
```

---

## Configuration

### 1. Current Settings (values.yaml)

```yaml
service:
  sessionAffinity: ClientIP           # Sticky sessions by client IP
  sessionAffinityTimeout: 3600        # Keep affinity for 1 hour
```

### 2. Pod Placement (deployment.yaml)

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - topologyKey: "kubernetes.io/hostname"
```

**What This Does:** No two ClamAV pods run on the same node (spreads load across nodes).

---

## Scaling to Multiple Pods

### Single Pod (Current)
```bash
helm upgrade clamav -f values.yaml -f values-dev.yaml -n bb18ab-tools
# replicaCount: 1 (from values-dev.yaml)
```

### Multiple Pods (Load Distribution)
```bash
helm upgrade clamav \
  -f values.yaml \
  -f values-dev.yaml \
  --set clamav.replicaCount=3 \
  -n bb18ab-tools
```

**With 3 pods:**
- Pod 1: Nodes in zone A
- Pod 2: Nodes in zone B
- Pod 3: Nodes in zone C
- (Anti-affinity prevents same node)

---

## Performance Considerations

### PVC Sharing (RWO vs RWX)

**Current Setup:** `ReadWriteOnce (RWO)` 500Mi PVC
- ✅ Single pod: Works perfectly
- ⚠️ Multiple pods: **Cannot share** (RWO = single mount)

**Options if scaling to 3+ pods:**

#### Option 1: Per-Pod PVCs (Recommended)
```yaml
# Each pod gets its own PVC
Pod 1 → PVC-A (500Mi)
Pod 2 → PVC-B (500Mi)
Pod 3 → PVC-C (500Mi)

Pros: ✅ No contention, ✅ Independent failure domains
Cons: ✗ 1.5Gi total storage needed
```

#### Option 2: Shared PVC (RWX)
```yaml
# All pods share one PVC
Pod 1 ┐
Pod 2 ├→ Shared PVC (500Mi)
Pod 3 ┘

Pros: ✅ 500Mi total storage, ✅ Shared state
Cons: ✗ Requires NFS/RWX storage, ✗ Concurrency issues
```

#### Option 3: emptyDir with Replication Job
- Each pod gets emptyDir (per-pod storage)
- CronJob replicates databases to all pods

---

## Recommended Setup (Current)

**1 Pod with 500Mi Persistent Storage**

✅ Pros:
- Simple, no concurrency issues
- 500Mi sufficient for 3-4 database versions
- Auto-cleanup prevents overflow
- Session affinity works perfectly
- Low maintenance

⚠️ When to scale:
- If single pod CPU maxes out (monitor: `oc top pods -n bb18ab-tools`)
- If response times increase >5 seconds
- If serving >100 concurrent clients

---

## Monitoring Multi-Pod Setup

If you scale to multiple pods, monitor:

```bash
# Pod distribution (should be on different nodes)
oc get pods -o wide -n bb18ab-tools | grep clamav

# CPU/Memory usage per pod
oc top pods -n bb18ab-tools | grep clamav

# Session distribution (rough estimate from logs)
for pod in $(oc get pods -n bb18ab-tools -o name | grep clamav); do
  echo "=== $pod ===" 
  oc logs $pod -n bb18ab-tools --tail=10 | grep -c "Connection from"
done
```

---

## Session Affinity Timeout

**Current:** 3600 seconds (1 hour)

- Clients disconnected >1 hour: Gets new pod assignment on next request
- Clients active <1 hour: Stays on same pod
- Adjust if needed: `--set service.sessionAffinityTimeout=7200` (2 hours)

---

## Troubleshooting

### Issue: Requests going to different pods for same client
- Check: `oc get svc clamav -n bb18ab-tools -o yaml | grep sessionAffinity`
- Should show: `sessionAffinity: ClientIP`

### Issue: Uneven load distribution (all traffic to one pod)
- Likely: Only 1 unique client IP (common in proxied setups)
- Solution: Load balance at client level, or use `sessionAffinity: None` (then add HAProxy/Ingress load balancing)

### Issue: Pod anti-affinity preventing scale-up
- Error: "pod does not fit on any node"
- Solution: Have ≥3 nodes with available resources, or relax anti-affinity

---

## Summary

✅ **Current Configuration is Optimal for:**
- Single pod, single or multiple clients
- Session affinity ensures consistency
- Pod anti-affinity spreads load across nodes
- 500Mi PVC with auto-cleanup handles storage efficiently

🚀 **To Scale Further:**
1. Monitor current pod metrics
2. When needed, set `replicaCount: 2-3` (requires review of PVC strategy)
3. Ensure sufficient nodes (one pod per node minimum)
4. Test session affinity behavior under load
