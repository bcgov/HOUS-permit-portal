import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../models/template-version"
import { useMst } from "../../setup/root"
import { ETemplateVersionStatus } from "../../types/enums"

export const useTemplateVersions = ({
  activityId,
  customErrorMessage,
  status,
  earlyAccess = false,
  isPublic = false,
}: {
  activityId?: string
  customErrorMessage?: string
  status?: ETemplateVersionStatus
  earlyAccess?: boolean
  isPublic?: boolean
}) => {
  const [error, setError] = useState<Error | undefined>(undefined)
  const { templateVersionStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore
  const { getTemplateVersionsByActivityId, getTemplateVersionsByStatus, fetchTemplateVersions, isLoading } =
    templateVersionStore
  status ??= currentSandbox?.templateVersionStatusScope || ETemplateVersionStatus.published

  const templateVersions = (
    activityId
      ? getTemplateVersionsByActivityId(activityId, status, earlyAccess, isPublic)
      : getTemplateVersionsByStatus(status, earlyAccess, isPublic)
  ) as ITemplateVersion[]
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      const errorMessage = customErrorMessage ?? t("errors.fetchTemplateVersions")
      try {
        const isSuccess = await fetchTemplateVersions(activityId, status, earlyAccess, isPublic)

        if (isSuccess) {
          setError(null)
        } else {
          setError(new Error(errorMessage))
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(errorMessage))
      }
    })()
  }, [activityId, currentSandbox?.id])

  return { templateVersions, error, isLoading }
}
