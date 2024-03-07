import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../models/template-version"
import { useMst } from "../../setup/root"

export const useTemplateVersions = ({
  activityId,
  customErrorMessage,
}: {
  activityId?: string
  customErrorMessage?: string
}) => {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { templateVersionStore } = useMst()
  const templateVersions = (
    activityId
      ? templateVersionStore.getTemplateVersionsByActivityId(activityId)
      : templateVersionStore.templateVersions
  ) as ITemplateVersion[]
  const { t } = useTranslation()

  useEffect(() => {
    if (!hasLoaded) {
      ;(async () => {
        const errorMessage = customErrorMessage ?? t("errors.fetchTemplateVersions")

        try {
          const isSuccess = await templateVersionStore.fetchTemplateVersions(activityId)

          isSuccess && setHasLoaded(true)
          !isSuccess && setError(new Error(errorMessage))
        } catch (e) {
          setError(e instanceof Error ? e : new Error(errorMessage))
        }
      })()
    }
  }, [hasLoaded, activityId])

  return { templateVersions, error, hasLoaded }
}
