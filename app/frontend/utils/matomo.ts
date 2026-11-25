import { OMNIAUTH_PROVIDERS } from "../models/user"

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AUTH_CALLBACK = /^\/api\/auth\/[^/]+\/callback\/?$/i
const MATOMO_LOGIN_ATTEMPT_KEY = "matomo.loginAttempt"

export const MATOMO_SPA_PAGE_READY_EVENT = "spaPageReady"
export const MATOMO_EVENT = "matomoEvent"
export const MATOMO_ANONYMOUS_ROLE = "anonymous"
export const MATOMO_AUTH_PROVIDERS = ["bceid", "bcsc", "idir"] as const
export const MATOMO_LOGIN_FAIL_REASONS = ["denied", "error", "cancelled", "unknown"] as const
/** 200ms so MTM can flush login_start before the Keycloak POST unloads the page. Ceiling: start can drop if MTM is slow; success/fail still work from sessionStorage. Upgrade: sendBeacon to the Matomo HTTP API. */
export const MATOMO_LOGIN_START_DELAY_MS = 200

export type MatomoAuthProvider = (typeof MATOMO_AUTH_PROVIDERS)[number]
export type MatomoLoginFailReason = (typeof MATOMO_LOGIN_FAIL_REASONS)[number]
export type MatomoLoginOutcome = "success" | "fail" | null

const OMNIAUTH_TO_MATOMO: Record<string, MatomoAuthProvider> = {
  [OMNIAUTH_PROVIDERS.bceid]: "bceid",
  [OMNIAUTH_PROVIDERS.basicBceid]: "bceid",
  [OMNIAUTH_PROVIDERS.businessBceid]: "bceid",
  [OMNIAUTH_PROVIDERS.bcsc]: "bcsc",
  [OMNIAUTH_PROVIDERS.idir]: "idir",
}

let capturedLoginFailReason: MatomoLoginFailReason | null = null
let matomoLoginSubmitPending = false

function matomoEnabled() {
  return Boolean(import.meta.env.VITE_MATOMO_URL)
}

function dataLayer() {
  return ((window as any)._mtm = (window as any)._mtm || [])
}

/** Path only: UUIDs → :id, auth callback collapsed, query string dropped. */
export function scrubMatomoVirtualPath(pathname: string): string {
  const path = (pathname.split("?")[0] || "/").replace(/\/+$/, "") || "/"
  if (AUTH_CALLBACK.test(path)) return "/auth/callback"
  return path
    .split("/")
    .map((segment) => (UUID_SEGMENT.test(segment) ? ":id" : segment))
    .join("/")
}

/** Full URL for MTM Custom URL / setCustomUrl (Matomo rejects a path-only value). */
export function matomoVirtualUrl(pathname: string, origin: string): string {
  return `${origin}${scrubMatomoVirtualPath(pathname)}`
}

export function matomoUserRole(loggedIn: boolean, role: string | null | undefined): string {
  if (!loggedIn || !role) return MATOMO_ANONYMOUS_ROLE
  return role
}

/** Skip anonymous `/` — RedirectScreen replaces it with `/about`, and `/` is Submitter home. */
export function shouldTrackMatomoSpaPageview(
  pathname: string,
  { isValidating, loggedIn }: { isValidating: boolean; loggedIn: boolean }
) {
  if (isValidating) return false
  if (!loggedIn && pathname === "/") return false
  return true
}

export function trackMatomoSpaPageview(
  pathname: string,
  dimensions: { userRole: string; jurisdiction: string | null },
  title = typeof document === "undefined" ? "" : document.title
) {
  if (!matomoEnabled()) return
  dataLayer().push({
    event: MATOMO_SPA_PAGE_READY_EVENT,
    pageUrl: matomoVirtualUrl(pathname, window.location.origin),
    pageTitle: title,
    userRole: dimensions.userRole,
    // Empty string overwrites a previous slug in the data layer so MTM leaves the dimension unset.
    jurisdiction: dimensions.jurisdiction ?? "",
  })
}

export function trackMatomoEvent(category: string, action: string, name?: string) {
  if (!matomoEnabled()) return
  dataLayer().push({
    event: MATOMO_EVENT,
    eventCategory: category,
    eventAction: action,
    eventName: name ?? "",
  })
}

export function isMatomoAuthProvider(value: unknown): value is MatomoAuthProvider {
  return (MATOMO_AUTH_PROVIDERS as readonly string[]).includes(value as string)
}

/** Map a Hub/OmniAuth provider id, or a Matomo name, to bceid | bcsc | idir. Unknown → null. */
export function matomoAuthProvider(value: string | null | undefined): MatomoAuthProvider | null {
  if (!value) return null
  if (isMatomoAuthProvider(value)) return value
  return OMNIAUTH_TO_MATOMO[value] ?? null
}

/** Allowlisted fail buckets only. Garbage / raw IdP text → null (never sent as a reason). */
export function matomoLoginFailReason(value: unknown): MatomoLoginFailReason | null {
  if ((MATOMO_LOGIN_FAIL_REASONS as readonly string[]).includes(value as string)) return value as MatomoLoginFailReason
  return null
}

export function matomoLoginFailEventName(
  provider: MatomoAuthProvider | null | undefined,
  reason: MatomoLoginFailReason
): string {
  return provider ? `${provider}:${reason}` : reason
}

export function matomoLoginOutcome({
  hasAttempt,
  loggedIn,
  failReason,
}: {
  hasAttempt: boolean
  loggedIn: boolean
  failReason: MatomoLoginFailReason | null
}): MatomoLoginOutcome {
  if (!hasAttempt) return null
  // Fail wins over an existing session. A stale cookie would otherwise mark a denied or cancelled return as login_success.
  if (failReason) return "fail"
  if (loggedIn) return "success"
  return null
}

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value
}

export function captureMatomoLoginFailReason(value: unknown): MatomoLoginFailReason | null {
  const reason = matomoLoginFailReason(firstQueryValue(value))
  if (reason) capturedLoginFailReason = reason
  return reason
}

export function takeMatomoLoginFailReason(): MatomoLoginFailReason | null {
  const reason = capturedLoginFailReason
  capturedLoginFailReason = null
  return reason
}

function readMatomoLoginAttempt(): { provider: MatomoAuthProvider } | null {
  try {
    const raw = sessionStorage.getItem(MATOMO_LOGIN_ATTEMPT_KEY)
    if (!raw) return null
    const provider = matomoAuthProvider(JSON.parse(raw)?.provider)
    return provider ? { provider } : null
  } catch {
    return null
  }
}

function writeMatomoLoginAttempt(provider: MatomoAuthProvider) {
  try {
    sessionStorage.setItem(MATOMO_LOGIN_ATTEMPT_KEY, JSON.stringify({ provider }))
  } catch {
    // Private mode can throw; start still goes to the data layer.
  }
}

function clearMatomoLoginAttempt() {
  try {
    sessionStorage.removeItem(MATOMO_LOGIN_ATTEMPT_KEY)
  } catch {
    // ignore
  }
}

export function beginMatomoLogin(provider: MatomoAuthProvider, form: HTMLFormElement) {
  if (matomoLoginSubmitPending) return
  matomoLoginSubmitPending = true
  writeMatomoLoginAttempt(provider)
  trackMatomoEvent("auth", "login_start", provider)
  window.setTimeout(() => form.submit(), MATOMO_LOGIN_START_DELAY_MS)
}

export function resolveAndTrackMatomoLoginAttempt({
  loggedIn,
  omniauthProvider,
}: {
  loggedIn: boolean
  omniauthProvider?: string | null
}) {
  const attempt = readMatomoLoginAttempt()
  const failReason = takeMatomoLoginFailReason()
  const outcome = matomoLoginOutcome({
    hasAttempt: Boolean(attempt),
    loggedIn,
    failReason,
  })
  clearMatomoLoginAttempt()
  if (outcome === "success") {
    trackMatomoEvent(
      "auth",
      "login_success",
      matomoAuthProvider(attempt?.provider) ?? matomoAuthProvider(omniauthProvider) ?? undefined
    )
  } else if (outcome === "fail" && failReason) {
    trackMatomoEvent(
      "auth",
      "login_fail",
      matomoLoginFailEventName(attempt?.provider ?? matomoAuthProvider(omniauthProvider), failReason)
    )
  }
}
