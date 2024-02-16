import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-funcitons"

export const usePermitApplication = () => {
  const { permitApplicationId } = useParams()
  const { pathname } = useLocation()
  const { permitApplicationStore } = useMst()

  const { currentPermitApplication, setCurrentPermitApplication, fetchPermitApplication } = permitApplicationStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      try {
        setCurrentPermitApplication(null)
        if (isUUID(permitApplicationId)) {
          await fetchPermitApplication(permitApplicationId)
          setCurrentPermitApplication(permitApplicationId)
        }
      } catch (e) {
        console.error(e)
        setError(new Error(t("errors.fetchPermitApplication")))
      }
    })()
  }, [pathname])

  return { currentPermitApplication, error }
}
