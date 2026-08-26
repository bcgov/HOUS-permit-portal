import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePermitApplication = ({ review }: { review?: boolean } = {}) => {
  const { permitApplicationId } = useParams()
  const { permitApplicationStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore

  const { currentPermitApplication, setCurrentPermitApplication, fetchPermitApplication } = permitApplicationStore

  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      try {
        if (!permitApplicationId) return

        setCurrentPermitApplication(null)
        if (isUUID(permitApplicationId)) {
          let permitApplication = await fetchPermitApplication(permitApplicationId, review)
          if (permitApplication) {
            setCurrentPermitApplication(permitApplicationId)
            setError(null)
          } else {
            setError(new Error(t("errors.fetchPermitApplication")))
          }
        }
      } catch (e) {
        console.error(e)
        setError(new Error(t("errors.fetchPermitApplication")))
      }
    })()
    // Refetch only when the permit application identity or sandbox changes — not on every
    // nested route segment (e.g. part-9 section navigation), which would wipe loaded Step Code checklists.
  }, [permitApplicationId, currentSandbox?.id, review])

  return { currentPermitApplication, error }
}
