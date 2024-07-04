import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../models/template-version"
import { useMst } from "../../setup/root"
import { ETemplateVersionStatus } from "../../types/enums"

export const useTemplateVersions = ({
  activityId,
  customErrorMessage,
  status = ETemplateVersionStatus.published,
}: {
  activityId?: string
  customErrorMessage?: string
  status?: ETemplateVersionStatus
}) => {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { templateVersionStore } = useMst()
  const templateVersions = (
    activityId
      ? templateVersionStore.getTemplateVersionsByActivityId(activityId, status)
      : templateVersionStore.getTemplateVersionsByStatus(status)
  ) as ITemplateVersion[]
  const { t } = useTranslation()

  useEffect(() => {
    if (!hasLoaded) {
      ;(async () => {
        const errorMessage = customErrorMessage ?? t("errors.fetchTemplateVersions")

        try {
          const isSuccess = await templateVersionStore.fetchTemplateVersions(activityId, status)

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
