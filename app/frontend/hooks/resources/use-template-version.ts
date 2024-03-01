import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const useTemplateVersion = () => {
  const { templateVersionId } = useParams()
  const { pathname } = useLocation()
  const { templateVersionStore } = useMst()
  const templateVersion = templateVersionStore.getTemplateVersionById(templateVersionId)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()

  useEffect(() => {
    if (!isUUID(templateVersionId)) {
      setError(new Error(t("errors.fetchTemplateVersion")))
      import.meta.env.DEV && console.error("template version id supplied to useTemplateVersion hook is not a uuid")
      return
    }

    if (!templateVersion || !templateVersion.isFullyLoaded) {
      ;(async () => {
        try {
          const isSuccess = await templateVersionStore.fetchTemplateVersion(templateVersionId)

          !isSuccess && setError(new Error(t("errors.fetchTemplateVersion")))
        } catch (e) {
          setError(e instanceof Error ? e : new Error(t("errors.fetchTemplateVersion")))
        }
      })()
    }
  }, [templateVersionId, templateVersion, pathname])

  return { templateVersion, error }
}
