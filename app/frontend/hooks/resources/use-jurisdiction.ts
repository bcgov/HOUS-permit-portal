import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-funcitons"

export const useJurisdiction = () => {
  const { jurisdictionId } = useParams()
  const { pathname } = useLocation()
  const { jurisdictionStore } = useMst()

  const { currentJurisdiction, setCurrentJurisdiction, fetchJurisdiction } = jurisdictionStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      try {
        setCurrentJurisdiction(null)
        if (isUUID(jurisdictionId)) {
          await fetchJurisdiction(jurisdictionId)
          setCurrentJurisdiction(jurisdictionId)
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(t("errors.fetchJurisdiction")))
      }
    })()
  }, [pathname])

  return { currentJurisdiction, error }
}
