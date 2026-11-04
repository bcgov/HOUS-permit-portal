// Only telemetry copies pass through this module. Never transform saved form data.
import { type Transport } from "@sentry/core"

export const roles = [
  "submitter",
  "reviewer",
  "review_manager",
  "regional_review_manager",
  "technical_support",
  "super_admin",
]
export const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export type FeedbackArea = "template_preview" | "jurisdiction_home" | "general"
export type FeedbackEntrypoint = "drawer" | "side_tab" | "crash_prompt"
export function eligibleCrash(event: any): boolean {
  if (event.type || !Array.isArray(event.exception?.values)) return false
  return event.exception.values.some(({ mechanism }: any) => {
    return (
      mechanism?.type !== "internal" &&
      (mechanism?.handled === false || mechanism?.type === "auto.function.react.error_boundary")
    )
  })
}

export function feedbackArea(route: string, role: unknown): FeedbackArea {
  if (route === "/template-versions/:templateVersionId/preview") return "template_preview"
  return route === "/" &&
    ["reviewer", "review_manager", "regional_review_manager", "technical_support"].includes(String(role))
    ? "jurisdiction_home"
    : "general"
}

// ObservedRoutes writes this metadata from the existing router definitions, never the page URL.
function routeTemplate(value: unknown): string {
  if (value === "/[unknown]" || value === "/[synthetic]") return value
  return typeof value === "string" &&
    /^\/(?:[a-z][a-z0-9_-]*|:[a-z]\w*)?(?:\/(?:[a-z][a-z0-9_-]*|:[a-z]\w*))*\/?$/i.test(value) &&
    !value.split("/").some((segment) => uuid.test(segment))
    ? value
    : "/[unknown]"
}

export function redactDescription(value: string, names: string[] = [], identifier = false): string {
  const sql = /\b(?:SELECT|INSERT|UPDATE|DELETE)\b|(?:ERROR|DETAIL):/i.test(value)
  let text = value
    .replace(/https?:\/\/[^\s"'<>]+/gi, (url) => url.replace(/(:\/\/)[^/@]+@/, "$1[Filtered]@").split(/[?#]/)[0])
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[Filtered email]")
    .replace(/\b(?:Bearer\s+\S+|sntrys_\S+|eyJ[A-Za-z0-9_.+-]+)\b/gi, "[Filtered credential]")
    .replace(
      /\b(password|secret|token|api[_ -]?key|first[_-]?name|last[_-]?name|full[_-]?name|name)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      (match, field) => (sql && /[:=]\s*(?:\$\d+|\?|:\w+)$/.test(match) ? match : `${field}=[Filtered]`)
    )
  if (!identifier)
    text = text
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, "[Filtered IP]")
      .replace(/(?:\+?\d[\d ().-]{7,}\d)/g, "[Filtered number]")
  for (const name of [...new Set(names)].filter(Boolean).sort((a, b) => b.length - a.length)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    text = text.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu"), "[Filtered name]")
  }
  if (sql) {
    text = text.replace(/'(?:[^']|'')*'/g, "'[Filtered]'").replace(/^(\s*DETAIL:).*$/gim, "$1 [Filtered]")
  }
  return text
}

const privateFields =
  /^(password|secret|token|authorization|api[_-]?key|email|name|first[_-]?name|last[_-]?name|full[_-]?name|ip_address|ip|args|arguments|params|parameters|binds|body|data|cookies|headers|vars|pre_context|post_context|context_line|answers|snapshot)$/i
const protocolFields = /^(id|event_id|associated_event_id|debug_id|trace_id|span_id|parent_span_id|release|version)$/

function scrubValue(value: any, names: string[], key = ""): any {
  if (typeof value === "string") {
    if (protocolFields.test(key)) return value
    return redactDescription(value, names, /^(filename|abs_path|code_file|function)$/.test(key))
  }
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, names))
  if (value && typeof value === "object") {
    if (key === "sdk") return value
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([field]) =>
            (field === "name" && ["browser", "os", "runtime", "device"].includes(key)) || !privateFields.test(field)
        )
        .filter(([field, item]: any) => field !== "stacktrace" || item?.frames?.length)
        .map(([field, item]) => [field, scrubValue(item, names, field)])
    )
  }
  return value
}

export function sanitizeEvent(event: any, origin: string): any | null {
  try {
    if (event.type !== undefined && event.type !== "feedback") return null
    if (event.exception?.values?.some((value: any) => value.mechanism?.type === "internal")) return null
    const names = event.contexts?.privacy?.names ?? []
    const clean = structuredClone(event)
    delete clean.extra
    delete clean.request
    delete clean.breadcrumbs
    delete clean.contexts?.privacy
    clean.tags = { ...clean.tags, component: "web" }
    clean.user = uuid.test(event.user?.id ?? "") && roles.includes(event.tags?.role) ? { id: event.user.id } : undefined
    clean.transaction = routeTemplate(event.tags?.route)
    clean.sdk = { ...clean.sdk, settings: { ...clean.sdk?.settings, infer_ip: "never" } }
    if (event.type === "feedback") {
      const message = event.contexts?.feedback?.message
      if (!message?.trim()) return null
      const route = routeTemplate(event.tags?.feedback_route)
      clean.transaction = route
      clean.contexts.feedback = { message, url: origin + route }
      const eventId = event.tags?.feedback_error_id ?? event.contexts?.feedback?.associated_event_id
      if (event.tags?.feedback_entrypoint === "crash_prompt" && /^[a-f0-9]{32}$/.test(eventId ?? "")) {
        clean.contexts.feedback.associated_event_id = eventId
      }
    } else {
      if (!event.exception?.values?.length) return null
      for (const value of event.exception.values) {
        if (value.stacktrace?.frames && !Array.isArray(value.stacktrace.frames)) return null
      }
    }
    delete clean.tags.feedback_route
    delete clean.tags.feedback_error_id
    return scrubValue(clean, names)
  } catch {
    return null
  }
}

// SDK-internal errors bypass processors/beforeSend. Check every envelope once,
// after the SDK has applied its scopes and source-map metadata.
export function privateTransport(
  base: Transport,
  origin: string,
  onCrash?: (eventId: string, userId: string) => void
): Transport {
  return {
    flush: (timeout) => base.flush(timeout),
    send: (envelope) => {
      try {
        const items: any[] = []
        for (const [header, event] of envelope[1]) {
          if (header.type !== "event" && header.type !== "feedback") continue
          const clean = sanitizeEvent(event, origin)
          if (!clean) continue
          items.push([{ type: header.type }, clean])
          if (eligibleCrash(event) && clean.user) {
            queueMicrotask(() => onCrash?.(clean.event_id, clean.user.id))
          }
        }
        if (!items.length) return Promise.resolve({ statusCode: 400 })
        return base.send([{ event_id: items[0][1].event_id, sent_at: new Date().toISOString() }, items])
      } catch {
        return Promise.resolve({ statusCode: 400 })
      }
    },
  }
}
