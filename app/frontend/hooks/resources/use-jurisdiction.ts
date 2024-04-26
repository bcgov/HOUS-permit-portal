import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const useJurisdiction = () => {
  const { jurisdictionId } = useParams()
  const { pathname } = useLocation()
  const { jurisdictionStore } = useMst()

  const { currentJurisdiction, setCurrentJurisdiction, fetchJurisdiction, setCurrentJurisdictionBySlug } =
    jurisdictionStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      try {
        if (isUUID(jurisdictionId)) {
          const jurisdiction = await fetchJurisdiction(jurisdictionId)
          jurisdiction && setCurrentJurisdiction(jurisdictionId)
        } else {
          //assume slug
          const jurisdiction = await fetchJurisdiction(jurisdictionId)
          jurisdiction && setCurrentJurisdictionBySlug(jurisdictionId)
        }
      } catch (e) {
        console.error(e.message)
        setError(new Error(t("errors.fetchJurisdiction")))
      }
    })()
  }, [pathname])

  return { currentJurisdiction, error }
}
