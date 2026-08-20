import { useEffect, useTransition } from "react"
import { useLocation, useNavigate } from "react-router-dom"

type TProjectDetailTab = {
  to: string
}

interface IUseProjectDetailTabsOptions {
  basePath: string | null
  tabs: TProjectDetailTab[]
  routeProjectId: string | undefined
  currentProjectId: string | undefined
  /** Inbox uses replace so back stays on the inbox list; submitter project screen uses push. */
  replaceOnTabChange?: boolean
}

export const useProjectDetailTabs = ({
  basePath,
  tabs,
  routeProjectId,
  currentProjectId,
  replaceOnTabChange = false,
}: IUseProjectDetailTabsOptions) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const projectMatchesRoute = Boolean(routeProjectId && currentProjectId === routeProjectId)

  useEffect(() => {
    if (!basePath) return

    // Bare project path → overview for the URL project only (never store current).
    if (location.pathname === basePath) {
      navigate(`${basePath}/overview`, { replace: true })
      return
    }

    // Teams merged into Teams & collaborators; keep old links from landing on Overview.
    const collaboratorsPath = `${basePath}/collaborators`
    if (location.pathname === `${basePath}/teams` && tabs.some((tab) => tab.to === collaboratorsPath)) {
      navigate(collaboratorsPath, { replace: true })
      return
    }

    // Unknown subpath canonicalize only once store matches the route (avoids cross-project redirects).
    if (!projectMatchesRoute || tabs.length === 0) return

    if (!tabs.some((tab) => location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`))) {
      navigate(`${basePath}/overview`, { replace: true })
    }
  }, [tabs, projectMatchesRoute, basePath, location.pathname, navigate])

  const matchedTabIndex = tabs.findIndex(
    (tab) => location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`)
  )
  const tabIndex = matchedTabIndex === -1 ? 0 : matchedTabIndex

  const handleTabChange = (index: number) => {
    const tab = tabs[index]
    if (!tab) return
    startTransition(() => {
      navigate(tab.to, replaceOnTabChange ? { replace: true } : undefined)
    })
  }

  return { projectMatchesRoute, tabIndex, handleTabChange, isPending }
}
