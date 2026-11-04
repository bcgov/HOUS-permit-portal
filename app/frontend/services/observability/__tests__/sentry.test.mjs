// Offline SDK integration tests: recording transports only, with no external delivery.
import * as Sentry from "@sentry/react"
import assert from "node:assert/strict"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { build } from "vite"

const directory = fileURLToPath(new URL("../", import.meta.url))
const result = await build({
  configFile: false,
  envFile: false,
  publicDir: false,
  logLevel: "silent",
  plugins: [
    {
      name: "sentry-test-entry",
      resolveId: (id) => (id.endsWith("virtual:sentry-tests") ? id : undefined),
      load: (id) =>
        id.endsWith("virtual:sentry-tests")
          ? ["privacy", "feedback-controller"]
              .map((name) => `export * from ${JSON.stringify(directory + name + ".ts")}`)
              .join("\n") + `\nexport { setSentryUser } from ${JSON.stringify(directory + "index.ts")}`
          : undefined,
    },
  ],
  build: { write: false, minify: false, lib: { entry: "virtual:sentry-tests", formats: ["es"] } },
})
const output = (Array.isArray(result) ? result[0] : result).output.find((item) => item.type === "chunk")
const {
  sanitizeEvent,
  redactDescription,
  feedbackArea,
  eligibleCrash,
  FeedbackController,
  feedbackController,
  setSentryUser,
  privateTransport,
} = await import(`data:text/javascript;base64,${Buffer.from(output.code).toString("base64")}`)
const id = "12345678-1234-1234-1234-123456789abc"
const otherId = "87654321-1234-1234-1234-123456789abc"
const origin = "https://test.buildingpermit.gov.bc.ca"
const preview = "/template-versions/:templateVersionId/preview"
const exception = {
  values: [
    {
      type: "TypeError",
      value: "Cannot load form: password=private-payload",
      mechanism: { handled: false },
      stacktrace: {
        frames: [
          {
            filename: origin + "/vite/assets/app-123.js?token=private-payload",
            lineno: 2,
            colno: 10,
            vars: { password: "private-payload" },
            context_line: "private-payload",
          },
        ],
      },
    },
  ],
}

function clientFor(t, { createForm, onCrash } = {}) {
  const envelopes = []
  const client = new Sentry.BrowserClient({
    dsn: `https://${"a".repeat(32)}@o1.ingest.us.sentry.io/1`,
    dataCollection: { userInfo: false },
    integrations: [],
    environment: "test",
    release: "synthetic",
    sendClientReports: false,
    stackParser: Sentry.defaultStackParser,
    transport: () =>
      privateTransport(
        {
          send: async (envelope) => {
            envelopes.push(envelope)
            return { statusCode: 200 }
          },
          flush: async () => true,
        },
        origin,
        onCrash
      ),
  })
  if (createForm) client.addIntegration({ name: "Feedback", createForm })
  Sentry.getCurrentScope().setClient(client)
  Sentry.setTag("route", preview)
  setSentryUser({ id, role: "reviewer" })
  t.after(async () => {
    feedbackController.close()
    await client.close()
    Sentry.getCurrentScope().setClient(undefined)
    Sentry.setUser(null)
    Sentry.setTags({ route: undefined, role: undefined })
  })
  return { client, envelopes, scope: Sentry.getCurrentScope() }
}
function form({ onOpen, onRemove } = {}) {
  return {
    appendToDom() {},
    open() {
      onOpen?.()
    },
    close() {},
    removeFromDom() {
      onRemove?.()
    },
  }
}
const feedbackTags = (entrypoint = "crash_prompt", eventId = "a".repeat(32)) => ({
  feedback_entrypoint: entrypoint,
  feedback_area: "template_preview",
  feedback_route: preview,
  feedback_error_id: eventId,
})

test("prepared SDK mechanisms distinguish React and unhandled crashes from handled/API and internal errors", () => {
  const event = (mechanism) => ({ exception: { values: [{ mechanism }] } })
  for (const type of [
    "auto.function.react.error_boundary",
    "auto.browser.global_handlers.onerror",
    "auto.browser.global_handlers.onunhandledrejection",
  ])
    assert.equal(eligibleCrash(event({ handled: type === "auto.function.react.error_boundary", type })), true)
  assert.equal(eligibleCrash(event({ handled: true, type: "generic" })), false)
  assert.equal(eligibleCrash(event({ handled: false, type: "internal" })), false)
  assert.equal(eligibleCrash({ type: "feedback" }), false)
})

test("SDK scopes and per-event feedback tags retain only approved outgoing data", async (t) => {
  const crashes = []
  const { client, envelopes, scope } = clientFor(t, { onCrash: (eventId) => crashes.push(eventId) })
  client.addEventProcessor((event) => {
    event.extra = { secret: "private-payload" }
    return event
  })
  scope.captureEvent(
    {
      exception,
      extra: { payload: "private-payload" },
      user: { email: "person@example.com", ip_address: "192.0.2.1" },
      transaction: "/permit-applications/" + id + "?token=private-payload",
      request: { headers: { Authorization: "private-payload" }, cookies: "private-payload", data: "private-payload" },
    },
    { attachments: [{ filename: "private-payload", data: "private-payload" }] }
  )
  Sentry.captureFeedback(
    {
      message:
        "Email person@example.com password=private-payload https://signed.invalid/?token=private-payload +1 250 555 0100",
      name: "private-payload",
      email: "person@example.com",
      tags: { ...feedbackTags(), secret: "private-payload" },
    },
    { includeReplay: false },
    scope
  )
  scope.captureException(new Error("private-payload"), {
    data: { __sentry__: true },
    mechanism: { type: "internal", handled: false },
  })
  await client.flush(2000)
  assert.equal(envelopes.length, 2)
  const serialized = JSON.stringify(envelopes)
  for (const forbidden of [
    "private-payload",
    "person@example.com",
    "Authorization",
    "context_line",

    "192.0.2.1",
    "555 0100",
    "feedback_route",
    "feedback_error_id",
  ])
    assert.equal(serialized.includes(forbidden), false, forbidden)
  const payloads = envelopes.flatMap((envelope) => envelope[1].map((item) => item[1]))
  const feedback = payloads.find((event) => event.type === "feedback")
  const error = payloads.find((event) => !event.type)
  assert.equal(feedback.contexts.feedback.associated_event_id, "a".repeat(32))
  assert.equal(feedback.tags.feedback_entrypoint, "crash_prompt")
  assert.equal(feedback.tags.feedback_area, "template_preview")
  assert.equal(error.transaction, preview)
  for (const event of payloads) {
    assert.deepEqual(event.user, { id })
    assert.equal(event.sdk.settings.infer_ip, "never")
  }
  assert.deepEqual(crashes, [error.event_id])
})

test("the final filter drops unsupported items, malformed events and privacy-dropped crashes", async () => {
  let delivered = 0,
    prompted = 0
  const transport = privateTransport(
    {
      send: async () => {
        delivered++
        return { statusCode: 200 }
      },
      flush: async () => true,
    },
    origin,
    () => prompted++
  )
  const response = await transport.send([
    { trace: { private: "private-payload" } },
    [
      ...["attachment", "log", "metric", "session", "client_report", "transaction", "replay_event", "profile"].map(
        (type) => [{ type }, { private: "private-payload" }]
      ),
      [
        { type: "event" },
        {
          event_id: "b".repeat(32),
          user: { id },
          tags: { role: "reviewer" },
          exception: { values: [{ mechanism: { handled: false }, stacktrace: { frames: "invalid" } }] },
        },
      ],
    ],
  ])
  await Promise.resolve()
  assert.equal(response.statusCode, 400)
  assert.equal(delivered, 0)
  assert.equal(prompted, 0)
  assert.equal(sanitizeEvent({ type: "feedback", event_id: "a".repeat(32), contexts: {} }, origin), null)
  assert.equal(sanitizeEvent({ type: "transaction" }, origin), null)
})

test("the final filter never preserves raw identifiers or unsafe route metadata", () => {
  for (const route of [
    origin + "/?token=private-payload",
    "/permit-applications/" + id,
    "/invitation?token=private-payload",
    "/applications/12345",
    undefined,
  ]) {
    const event = sanitizeEvent({ event_id: "a".repeat(32), tags: { route }, exception }, origin)
    assert.equal(event.transaction, "/[unknown]")
  }
})

test("messages preserve diagnostics with targeted personal data redaction", () => {
  for (const message of [
    "Cannot read properties of undefined (reading 'permitApplication')",
    "Cannot set properties of null (setting 'value')",
    "store.fetch is not a function",
    "permitApplication is not defined",
    "Failed to fetch",
    "Maximum call stack size exceeded",
  ])
    assert.equal(redactDescription(message), message)
  assert.equal(
    redactDescription("Unexpected token < in JSON: person@example.com"),
    "Unexpected token < in JSON: [Filtered email]"
  )
  assert.equal(
    redactDescription("Cannot render unsupported permit version"),
    "Cannot render unsupported permit version"
  )
  assert.equal(
    redactDescription('name="Derek Example" person@example.com password=secret https://signed.invalid/?token=secret'),
    "name=[Filtered] [Filtered email] password=[Filtered] https://signed.invalid/"
  )
})

test("native diagnostics survive while known names and private containers are scrubbed", () => {
  const event = {
    event_id: "a".repeat(32),
    release: "hous-permit-portal@123456789abcdef",
    sdk: { name: "sentry.javascript.react", version: "11.8.0" },
    user: { id, name: "Quinn Redwood", email: "person@example.com" },
    tags: { role: "reviewer" },
    contexts: { privacy: { names: ["Quinn", "Redwood"] }, browser: { name: "Chrome", version: "142" } },
    extra: { formAnswers: "private-payload" },
    request: { headers: { Authorization: "private-payload" } },
    exception: {
      values: [
        {
          type: "TypeError",
          value: "Cannot deliver reminder to Quinn Redwood person@example.com",
          mechanism: { type: "auto.browser.global_handlers.onerror", handled: false },
          stacktrace: {
            frames: [
              {
                filename: origin + "/vite/assets/application-1234567890.js?token=secret",
                function: "Object.send (async)",
                lineno: 38,
                vars: { name: "Quinn Redwood" },
              },
            ],
          },
        },
      ],
    },
    debug_meta: {
      images: [{ type: "sourcemap", debug_id: id, code_file: origin + "/vite/assets/application-1234567890.js" }],
    },
  }
  const clean = sanitizeEvent(event, origin)
  assert.equal(clean.sdk.name, event.sdk.name)
  assert.equal(clean.contexts.browser.name, "Chrome")
  assert.equal(clean.exception.values[0].mechanism.handled, false)
  assert.equal(
    clean.exception.values[0].stacktrace.frames[0].filename,
    origin + "/vite/assets/application-1234567890.js"
  )
  assert.deepEqual(clean.debug_meta, event.debug_meta)
  assert.equal(clean.release, event.release)
  assert.equal(
    clean.exception.values[0].value,
    "Cannot deliver reminder to [Filtered name] [Filtered name] [Filtered email]"
  )
  for (const forbidden of ["Quinn", "Redwood", "person@example.com", "private-payload", "token=secret", '"privacy"'])
    assert.equal(JSON.stringify(clean).includes(forbidden), false, forbidden)
  assert.equal(event.exception.values[0].value.includes("Quinn"), true)
  assert.equal(redactDescription("Mayfly failed for May", ["May"]), "Mayfly failed for [Filtered name]")
  assert.equal(redactDescription("Failed for Quinn (Redwood)", ["Quinn (Redwood)"]), "Failed for [Filtered name]")
})

test("error envelopes retain safe diagnostics, generated functions and omit missing stacks", () => {
  const event = sanitizeEvent(
    {
      event_id: "a".repeat(32),
      exception: {
        values: [
          {
            type: "TypeError",
            value: "store.fetch is not a function",
            stacktrace: {
              frames: [
                {
                  filename: origin + "/vite/assets/application-abc.js?token=secret",
                  function: "Object.fetch (async)",
                  lineno: 12,
                  vars: { private: "private-payload" },
                },
              ],
            },
          },
          { type: "Error", value: "person@example.com" },
        ],
      },
    },
    origin
  )
  assert.equal(event.exception.values[0].value, "store.fetch is not a function")
  assert.equal(event.exception.values[0].stacktrace.frames[0].function, "Object.fetch (async)")
  assert.equal("stacktrace" in event.exception.values[1], false)
  for (const forbidden of ["person@example.com", "secret", "private-payload"])
    assert.equal(JSON.stringify(event).includes(forbidden), false)
})

test("native scopes retain capture-time identity, route and debug IDs across delayed processors", async (t) => {
  const { client, envelopes, scope } = clientFor(t)
  let finishProcessing
  client.addEventProcessor(
    (event) =>
      new Promise((resolve) => {
        finishProcessing = () => resolve(event)
      })
  )
  const debugId = "abcdefab-1234-1234-1234-123456789abc"
  scope.captureEvent({
    exception,
    debug_meta: {
      images: [
        { type: "sourcemap", debug_id: debugId, code_file: origin + "/vite/assets/app-123.js?token=private-payload" },
      ],
    },
  })
  setSentryUser({ id: otherId, role: "submitter" })
  Sentry.setTag("route", "/")
  finishProcessing()
  await client.flush(2000)
  const sent = envelopes[0][1][0][1]
  assert.equal(sent.user.id, id)
  assert.equal(sent.tags.role, "reviewer")
  assert.equal(sent.transaction, preview)
  assert.equal(sent.debug_meta.images[0].debug_id, debugId)
  assert.equal(JSON.stringify(sent).includes("private-payload"), false)
})

test("native form tags retain opening context and exact crash linkage through navigation", async (t) => {
  let options,
    opened = 0
  const controller = new FeedbackController()
  const { client, envelopes, scope } = clientFor(t, {
    createForm: async (value) => {
      options = value
      return form({ onOpen: () => opened++ })
    },
  })
  controller.crash("b".repeat(32), id)
  await Promise.resolve()
  const crashOptions = options
  assert.equal(opened, 1)
  assert.equal(await controller.open("drawer"), false)
  Sentry.setTag("route", "/")
  Sentry.captureFeedback(
    { message: "Synthetic crash description", tags: options.tags },
    { includeReplay: false },
    scope
  )
  await client.flush(2000)
  const sent = envelopes[0][1][0][1]
  assert.equal(sent.contexts.feedback.associated_event_id, "b".repeat(32))
  assert.equal(sent.contexts.feedback.url, origin + preview)
  assert.equal(sent.tags.feedback_entrypoint, "crash_prompt")
  assert.equal(sent.tags.feedback_area, "template_preview")
  options.onFormClose()
  controller.crash("c".repeat(32), id)
  assert.equal(opened, 1)
  assert.equal(await controller.open("drawer"), true)
  assert.equal(options.tags.feedback_area, "jurisdiction_home")
  assert.equal(options.tags.feedback_error_id, "")
  crashOptions.onFormSubmitted()
  assert.equal(await controller.open("side_tab"), false)
  Sentry.captureFeedback(
    { message: "Synthetic manual description", tags: options.tags },
    { includeReplay: false },
    scope
  )
  await client.flush(2000)
  assert.equal(envelopes[1][1][0][1].contexts.feedback.associated_event_id, undefined)
  options.onFormClose()
})

test("account changes and logout close the real coordinator and clear SDK identity", async (t) => {
  let removed = 0
  clientFor(t, { createForm: async () => form({ onRemove: () => removed++ }) })
  assert.equal(await feedbackController.open("drawer"), true)
  setSentryUser({ id: otherId, role: "submitter" })
  assert.equal(removed, 1)
  assert.deepEqual(Sentry.getIsolationScope().getUser(), { id: otherId })
  await feedbackController.open("drawer")
  setSentryUser(undefined)
  assert.equal(removed, 2)
  assert.equal(Sentry.getIsolationScope().getUser().id, undefined)
  assert.equal(Sentry.getIsolationScope().getScopeData().tags.role, undefined)
})

test("logout during SDK form creation cannot open a stale form", async (t) => {
  let finish,
    opened = false
  clientFor(t, {
    createForm: () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  })
  const opening = feedbackController.open("drawer")
  setSentryUser(undefined)
  finish(form({ onOpen: () => (opened = true) }))
  assert.equal(await opening, false)
  assert.equal(opened, false)
})

test("staff area classification matches all four permitted roles", () => {
  for (const role of [
    "reviewer",
    "review_manager",
    "regional_review_manager",
    "technical_support",
    "submitter",
    "super_admin",
  ])
    assert.equal(feedbackArea("/", role), ["submitter", "super_admin"].includes(role) ? "general" : "jurisdiction_home")
  assert.equal(feedbackArea("/standardization-preview", "reviewer"), "general")
  assert.equal(feedbackArea(preview, undefined), "template_preview")
})

test("crashes preserve drafts and ignore public or stale-account errors", async (t) => {
  const controller = new FeedbackController()
  let opened = 0
  clientFor(t, { createForm: async () => form({ onOpen: () => opened++ }) })
  await controller.open("drawer")
  controller.crash("a".repeat(32), id)
  assert.equal(opened, 1)
  controller.close()
  setSentryUser(undefined)
  controller.crash("b".repeat(32), id)
  controller.crash("c".repeat(32), "")
  await Promise.resolve()
  assert.equal(opened, 1)
  setSentryUser({ id: otherId, role: "reviewer" })
  controller.crash("d".repeat(32), id)
  assert.equal(opened, 1)
  await controller.open("drawer")
  assert.equal(opened, 2)
  controller.close()
})

test("form opening waits for the drawer transition and logout cancels the pending opening", async (t) => {
  clientFor(t, {
    createForm: async () => {
      throw new Error("must not create a form after logout")
    },
  })
  let finishTransition
  feedbackController.beforeOpen = () =>
    new Promise((resolve) => {
      finishTransition = resolve
    })
  t.after(() => (feedbackController.beforeOpen = undefined))
  const opening = feedbackController.open("drawer")
  setSentryUser(undefined)
  finishTransition()
  assert.equal(await opening, false)
})

test("without an installed feedback integration, forms and crash prompts remain disabled", async (t) => {
  clientFor(t)
  const controller = new FeedbackController()
  assert.equal(controller.enabled, false)
  assert.equal(await controller.open("drawer"), false)
  controller.crash("a".repeat(32), id)
  assert.equal(await controller.open("side_tab"), false)
})
