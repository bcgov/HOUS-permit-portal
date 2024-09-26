import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../models/template-version"
import { useMst } from "../../setup/root"
import { ETemplateVersionStatus } from "../../types/enums"

export const useTemplateVersions = ({
  activityId,
  customErrorMessage,
  status,
}: {
  activityId?: string
  customErrorMessage?: string
  status?: ETemplateVersionStatus
}) => {
  const [error, setError] = useState<Error | undefined>(undefined)
  const { templateVersionStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore
  const { getTemplateVersionsByActivityId, getTemplateVersionsByStatus, fetchTemplateVersions, isLoading } =
    templateVersionStore
  status ??= currentSandbox?.templateVersionStatusScope || ETemplateVersionStatus.published

  const templateVersions = (
    activityId ? getTemplateVersionsByActivityId(activityId, status) : getTemplateVersionsByStatus(status)
  ) as ITemplateVersion[]
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      const errorMessage = customErrorMessage ?? t("errors.fetchTemplateVersions")

      try {
        const isSuccess = await fetchTemplateVersions(activityId, status)

        !isSuccess && setError(new Error(errorMessage))
      } catch (e) {
        setError(e instanceof Error ? e : new Error(errorMessage))
      }
    })()
  }, [activityId, currentSandbox?.id])

  return { templateVersions, error, isLoading }
}
