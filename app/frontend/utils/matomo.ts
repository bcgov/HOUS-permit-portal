const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AUTH_CALLBACK = /^\/api\/auth\/[^/]+\/callback\/?$/i

export const MATOMO_SPA_PAGE_READY_EVENT = "spaPageReady"
export const MATOMO_ANONYMOUS_ROLE = "anonymous"

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
