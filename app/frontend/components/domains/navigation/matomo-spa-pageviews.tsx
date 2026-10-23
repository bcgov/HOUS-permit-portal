import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { matchPath, useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { matomoUserRole, shouldTrackMatomoSpaPageview, trackMatomoSpaPageview } from "../../../utils/matomo"
import { isUUID } from "../../../utils/utility-functions"

/** Same prefixes as `path=` in index.tsx. matchPath keeps nested URLs working if those Routes move. */
const MATOMO_JURISDICTION_ROUTES = [
  "/jurisdictions/:jurisdictionId",
  "/projects/:permitProjectId",
  "/permit-applications/:permitApplicationId",
] as const

if (import.meta.env.DEV) {
  const navSource = Object.values(import.meta.glob("./index.tsx", { query: "?raw", import: "default", eager: true }))[0]
  if (typeof navSource !== "string") {
    throw new Error(
      "Matomo jurisdiction tracking could not read navigation/index.tsx. Update the glob in matomo-spa-pageviews.tsx."
    )
  }
  for (const route of MATOMO_JURISDICTION_ROUTES) {
    if (!navSource.includes(`path="${route}`)) {
      throw new Error(
        `Matomo jurisdiction tracking assumes ${route} but navigation/index.tsx has no matching Route. Update MATOMO_JURISDICTION_ROUTES.`
      )
    }
  }
}

function firstRouteParam(pathname: string, path: string) {
  const name = path
    .split("/")
    .find((segment) => segment.startsWith(":"))
    ?.slice(1)
  if (!name) return
  const params = matchPath({ path: `${path}/*` }, pathname)?.params ?? matchPath({ path, end: true }, pathname)?.params
  return params?.[name]
}

function asSlug(value: string | null | undefined) {
  if (!value || value === "new" || isUUID(value)) return null
  return value
}

function matomoJurisdictionSlug(
  pathname: string,
  ctx: {
    staffSlug?: string | null
    jurisdictionById: (id: string) => string | null | undefined
    projectById: (id: string) => string | null | undefined
    applicationById: (id: string) => string | null | undefined
  }
) {
  const staffSlug = asSlug(ctx.staffSlug)
  const [jurisdictionPath, projectPath, applicationPath] = MATOMO_JURISDICTION_ROUTES

  const jurisdictionId = firstRouteParam(pathname, jurisdictionPath)
  if (jurisdictionId) return asSlug(jurisdictionId) ?? asSlug(ctx.jurisdictionById(jurisdictionId))

  const projectId = firstRouteParam(pathname, projectPath)
  if (projectId) return asSlug(ctx.projectById(projectId))

  const applicationId = firstRouteParam(pathname, applicationPath)
  if (applicationId) return asSlug(ctx.applicationById(applicationId))

  return staffSlug
}

export const MatomoSpaPageviews = observer(function MatomoSpaPageviews() {
  const { pathname } = useLocation()
  const { sessionStore, userStore, jurisdictionStore, permitProjectStore, permitApplicationStore } = useMst()
  const { isValidating, loggedIn } = sessionStore
  const currentUser = userStore.currentUser

  useEffect(() => {
    if (!shouldTrackMatomoSpaPageview(pathname, { isValidating, loggedIn })) return
    trackMatomoSpaPageview(pathname, {
      userRole: matomoUserRole(loggedIn, currentUser?.role),
      jurisdiction: matomoJurisdictionSlug(pathname, {
        staffSlug: currentUser?.isJurisdictionStaff ? currentUser.jurisdiction?.slug : null,
        jurisdictionById: (id) => jurisdictionStore.jurisdictionMap.get(id)?.slug,
        projectById: (id) => permitProjectStore.permitProjectMap.get(id)?.jurisdiction?.slug,
        applicationById: (id) => permitApplicationStore.permitApplicationMap.get(id)?.jurisdiction?.slug,
      }),
    })
    // one hit per route/session flip. Maps filling in later must not double-count.
  }, [pathname, isValidating, loggedIn])

  return null
})
