const assert = require("node:assert/strict")
const { spawnSync } = require("node:child_process")
const { mkdirSync, mkdtempSync, rmSync, writeFileSync } = require("node:fs")
const { join, resolve } = require("node:path")
const test = require("node:test")
const prepareBuildArgs = require("./build-args.cjs")

const root = resolve(__dirname, "../../../..")
const helper = join(root, "devops/docker/app/with-vite-env.rb")

function payload(args) {
  return args.slice("FRONTEND_BUILD_ENV_JSON=".length)
}

test("new GitHub VITE variables reach actual Vite bundles without per-variable declarations", () => {
  mkdirSync(join(root, "tmp"), { recursive: true })
  const dir = mkdtempSync(join(root, "tmp/vite-env-test-"))
  const entry = join(dir, "probe.js")
  writeFileSync(
    entry,
    `export const values = {
    future: import.meta.env.VITE_FUTURE_SETTING,
    forcePublish: import.meta.env.VITE_ENABLE_TEMPLATE_FORCE_PUBLISH === "true",
    qa: import.meta.env.VITE_QA_MODE,
    backend: import.meta.env.BPH_TEST_BACKEND_ONLY,
  }`
  )
  const value = 'https://example.invalid/?one=two&quoted="value" $HOME $(false)\nnext line'
  try {
    for (const forcePublish of [undefined, "false", "true"]) {
      const vars = { VITE_FUTURE_SETTING: value, VITE_QA_MODE: "false", BPH_TEST_BACKEND_ONLY: "backend-only" }
      if (forcePublish !== undefined) vars.VITE_ENABLE_TEMPLATE_FORCE_PUBLISH = forcePublish
      const args = prepareBuildArgs({ variablesJson: JSON.stringify(vars) })
      const result = spawnSync(
        "ruby",
        [
          helper,
          process.execPath,
          "--input-type=module",
          "-e",
          `
        import { build } from 'vite';
        if (process.env.BPH_TEST_BACKEND_ONLY) throw new Error('Backend configuration leaked');
        const result = await build({
          configFile: false, envFile: false, root: ${JSON.stringify(dir)}, logLevel: 'silent',
          build: { write: false, minify: false, lib: { entry: ${JSON.stringify(entry)}, formats: ['es'] } },
        });
        const chunk = result[0].output.find(item => item.type === 'chunk');
        const module = await import('data:text/javascript;base64,' + Buffer.from(chunk.code).toString('base64'));
        console.log(JSON.stringify(module.values));
      `,
        ],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            ...process.env,
            NODE_ENV: "production",
            FRONTEND_BUILD_ENV_JSON: payload(args),
            VITE_ENABLE_TEMPLATE_FORCE_PUBLISH: undefined,
            BPH_TEST_BACKEND_ONLY: undefined,
          },
        }
      )
      assert.equal(result.status, 0, result.stderr)
      assert.deepEqual(JSON.parse(result.stdout), { future: value, forcePublish: forcePublish === "true", qa: "false" })
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("generated release labels use the checked-out SHA and override configured labels", () => {
  const sha = "a".repeat(40)
  const args = prepareBuildArgs({
    variablesJson: JSON.stringify({ VITE_BCEID_URL: "default", VITE_RELEASE_VERSION: "stale" }),
    releaseVersionPrefix: "dev-feature/example",
    sha,
  })
  assert.deepEqual(JSON.parse(payload(args)), {
    VITE_BCEID_URL: "default",
    VITE_RELEASE_VERSION: `dev-feature/example-${sha}`,
  })
})

test("equivalent configuration keeps the same build argument regardless of key ordering", () => {
  assert.equal(
    prepareBuildArgs({ variablesJson: '{"VITE_B":"two","VITE_A":"one"}' }),
    prepareBuildArgs({ variablesJson: '{"VITE_A":"one","VITE_B":"two"}' })
  )
})

test("malformed or non-public payloads fail before executing the build command", () => {
  for (const variablesJson of ["not JSON", "null", "[]"]) {
    assert.throws(() => prepareBuildArgs({ variablesJson }))
  }
  for (const value of [
    "not JSON",
    "null",
    "[]",
    '{"BACKEND_TOKEN":"private-marker"}',
    '{"VITE_FLAG":true}',
    '{"VITE_bad":"value"}',
  ]) {
    const result = spawnSync("ruby", [helper, process.execPath, "-e", 'console.log("must not run")'], {
      encoding: "utf8",
      env: { ...process.env, FRONTEND_BUILD_ENV_JSON: value },
    })
    assert.notEqual(result.status, 0)
    assert.equal(result.stdout, "")
    assert.doesNotMatch(result.stderr, /private-marker/)
  }
})

test("asset command failures propagate through the environment helper", () => {
  const result = spawnSync("ruby", [helper, process.execPath, "-e", "process.exit(23)"], {
    env: { ...process.env, FRONTEND_BUILD_ENV_JSON: "{}" },
  })
  assert.equal(result.status, 23)
})
