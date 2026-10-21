// Only telemetry copies pass through this module. Never transform saved form data.
import { SDK_VERSION, type Transport } from "@sentry/core"

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

const identifier = (value: unknown) =>
  typeof value === "string" && /^[A-Za-z_$][A-Za-z0-9_$:.!?<>=# -]{0,200}$/.test(value) ? value : "Error"

export function redactDescription(value: string): string {
  return value
    .replace(/https?:\/\/\S+/gi, "[Filtered URL]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[Filtered email]")
    .replace(/\b(?:Bearer\s+\S+|sntrys_\S+|eyJ[A-Za-z0-9_.+-]+)\b/gi, "[Filtered credential]")
    .replace(/\b(password|secret|token|api[_ -]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[Filtered]")
    .replace(/(?:\+?\d[\d ().-]{7,}\d)/g, "[Filtered number]")
}

function frame(value: any) {
  const filename = String(value.filename ?? "").split(/[?#]/)[0]
  // Keep emitted asset paths for debug-ID matching; never preserve arbitrary document URLs.
  const asset = filename.match(/(?:^|\/)(?:vite\/)?assets\/[A-Za-z0-9_./-]+\.m?js$/)?.[0]
  const source = filename.match(/(?:^|\/)(?:app\/frontend|src)\/[A-Za-z0-9_./-]+\.[cm]?[jt]sx?$/)?.[0]
  const clean: Record<string, unknown> = {
    filename: asset || source || "[external]",
    function: identifier(value.function),
    in_app: value.in_app === true,
  }
  for (const key of ["lineno", "colno"]) if (Number.isInteger(value[key])) clean[key] = value[key]
  if (typeof value.debug_id === "string" && uuid.test(value.debug_id)) clean.debug_id = value.debug_id
  return clean
}

export function sanitizeEvent(event: any, origin: string): any | null {
  try {
    if (event.type !== undefined && event.type !== "feedback") return null
    if (event.exception?.values?.some((value: any) => value.mechanism?.type === "internal")) return null
    if (!/^[a-f0-9]{32}$/.test(event.event_id ?? "")) return null
    const tags = event.tags ?? {}
    const clean: any = {
      event_id: event.event_id,
      timestamp: event.timestamp,
      platform: "javascript",
      level: event.type === "feedback" ? "info" : "error",
      environment: event.environment,
      release: event.release,
      tags: { component: "web" },
      sdk: { name: "sentry.javascript.react", version: SDK_VERSION, settings: { infer_ip: "never" } },
    }
    if (uuid.test(event.user?.id ?? "") && roles.includes(tags.role)) {
      clean.user = { id: event.user.id }
      clean.tags.role = tags.role
    }
    clean.transaction = routeTemplate(tags.route)
    if (event.type === "feedback") {
      const message = event.contexts?.feedback?.message
      if (
        !["drawer", "side_tab", "crash_prompt"].includes(tags.feedback_entrypoint) ||
        !["template_preview", "jurisdiction_home", "general"].includes(tags.feedback_area) ||
        typeof message !== "string" ||
        !message.trim()
      )
        return null
      const route = routeTemplate(tags.feedback_route)
      clean.transaction = route
      clean.type = "feedback"
      clean.tags.feedback_entrypoint = tags.feedback_entrypoint
      clean.tags.feedback_area = tags.feedback_area
      clean.contexts = {
        feedback: {
          message: redactDescription(message),
          url: origin + route,
        },
      }
      // createForm supports per-form tags but not associatedEventId. The private
      // tag carries its immutable link; only the standard feedback field is sent.
      const eventId = tags.feedback_error_id ?? event.contexts?.feedback?.associated_event_id
      if (tags.feedback_entrypoint === "crash_prompt" && /^[a-f0-9]{32}$/.test(eventId ?? "")) {
        clean.contexts.feedback.associated_event_id = eventId
      }
    } else {
      if (!Array.isArray(event.exception?.values) || !event.exception.values.length) return null
      clean.exception = {
        values: event.exception.values.map((value: any) => ({
          type: identifier(value.type),
          value: "[Filtered]",
          stacktrace: { frames: (value.stacktrace?.frames ?? []).map(frame) },
        })),
      }
      // Symbolication uses the debug ID, not the browser's original URL.
      if (Array.isArray(event.debug_meta?.images)) {
        clean.debug_meta = {
          images: event.debug_meta.images
            .filter((image: any) => image.type === "sourcemap" && uuid.test(image.debug_id))
            .map((image: any) => ({
              type: "sourcemap",
              debug_id: image.debug_id,
              code_file: frame({ filename: image.code_file }).filename,
            })),
        }
      }
    }
    return clean
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
