# Offline Sentry UI fixture

From the repository root, run:

```sh
node scripts/sentry/browser-test.mjs
```

Open [http://127.0.0.1:4179](http://127.0.0.1:4179).

Preview the feedback form, trigger a synthetic React crash, simulate logout or
submission failure, and inspect sanitized events recorded on the page. Nothing
is sent to Sentry, and no Sentry credentials are needed.

Use **Reset fixture** to start over. Press **Ctrl+C** in the terminal to stop.
