import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { generatePath, matchPath, useLocation, useNavigate, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const useJurisdiction = () => {
  const { jurisdictionId } = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { jurisdictionStore, userStore } = useMst()

  const { currentUser } = userStore

  const { currentJurisdiction, setCurrentJurisdiction, fetchJurisdiction, setCurrentJurisdictionBySlug } =
    jurisdictionStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  const jursidictionRoutes = [
    "/jurisdictions/:jurisdictionId/submission-inbox",
    "/jurisdictions/:jurisdictionId/configuration-management",
    "/jurisdictions/:jurisdictionId/configuration-management/feature-access/submissions-inbox-setup",
    "/jurisdictions/:jurisdictionId/configuration-management/energy-step",
    "/jurisdictions/:jurisdictionId/users",
    "/jurisdictions/:jurisdictionId/users/invite",
    "/jurisdictions/:jurisdictionId/api-settings",
  ]

  const findMatchingPathTemplate = (pathname) => {
    for (let route of jursidictionRoutes) {
      const match = matchPath(route, pathname)
      if (match) {
        return route
      }
    }
    return null
  }

  // check if this is a jurisdiction specific route
  // if it is and if the user's jurisdiction changes, navigate to the same route for the new jurisdiction
  useEffect(() => {
    if (currentUser?.isRegionalReviewManager && currentUser?.jurisdiction?.id != jurisdictionId) {
      const originalPath = findMatchingPathTemplate(pathname)
      if (!originalPath) return

      // Get the existing query params
      const existingQuery = window.location.search

      // Generate the new path
      const path = generatePath(originalPath, { jurisdictionId: currentUser.jurisdiction.slug })

      // Append the existing query params to the new path
      const newPathWithQuery = `${path}${existingQuery}`

      // Navigate to the new path while preserving query params
      navigate(newPathWithQuery, { replace: true })
    }
  }, [currentUser?.jurisdiction])

  useEffect(() => {
    ;(async () => {
      try {
        if (isUUID(jurisdictionId)) {
          const jurisdiction = await fetchJurisdiction(jurisdictionId)
          if (jurisdiction) {
            setError(null)
            setCurrentJurisdiction(jurisdictionId)
          }
        } else {
          //assume slug
          const jurisdiction = await fetchJurisdiction(jurisdictionId)
          if (jurisdiction) {
            setError(null)
            setCurrentJurisdictionBySlug(jurisdictionId)
          }
        }
      } catch (e) {
        console.error(e.message)
        setError(new Error(t("errors.fetchJurisdiction")))
      }
    })()
  }, [pathname])

  return { currentJurisdiction, error }
}
