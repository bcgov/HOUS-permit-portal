import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePermitApplication = ({ review }: { review?: boolean } = {}) => {
  const { permitApplicationId } = useParams()
  const { pathname } = useLocation()
  const { permitApplicationStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore

  const { currentPermitApplication, setCurrentPermitApplication, fetchPermitApplication } = permitApplicationStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      try {
        setCurrentPermitApplication(null)
        if (isUUID(permitApplicationId)) {
          let permitApplication = await fetchPermitApplication(permitApplicationId, review)
          if (permitApplication) {
            setCurrentPermitApplication(permitApplicationId)
            setError(null)
          }
        }
      } catch (e) {
        console.error(e)
        setError(new Error(t("errors.fetchPermitApplication")))
      }
    })()
  }, [pathname, currentSandbox?.id])

  return { currentPermitApplication, error }
}
