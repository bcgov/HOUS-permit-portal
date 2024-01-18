import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-funcitons"

export const useJurisdiction = () => {
  const { jurisdictionId } = useParams()
  const { jurisdictionStore } = useMst()

  const { currentJurisdiction, setCurrentJurisdiction, fetchJurisdiction } = jurisdictionStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      try {
        if (isUUID(jurisdictionId)) {
          const j = await fetchJurisdiction(jurisdictionId)
          setCurrentJurisdiction(j)
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(t("errors.fetchJurisdiction")))
      }
    })()
  }, [jurisdictionId])

  return { currentJurisdiction, error }
}
