import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const useRequirementTemplate = () => {
  const { requirementTemplateId } = useParams()
  const { pathname } = useLocation()
  const { requirementTemplateStore } = useMst()
  const requirementTemplate = requirementTemplateStore.getRequirementTemplateById(requirementTemplateId)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    if (!isUUID(requirementTemplateId)) {
      setError(new Error(t("errors.fetchRequirementTemplate")))
      import.meta.env.DEV &&
        console.error("requirement template id supplied to useRequirementTemplate hook is not a uuid")
      return
    }

    ;(async () => {
      try {
        const isSuccess = await requirementTemplateStore.fetchRequirementTemplate(requirementTemplateId)
        if (isSuccess) {
          setError(null)
        } else {
          setError(new Error(t("errors.fetchRequirementTemplate")))
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(t("errors.fetchRequirementTemplate")))
      }
    })()
  }, [requirementTemplateId, requirementTemplate, pathname])

  return { requirementTemplate, error }
}
