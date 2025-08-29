import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../models/template-version"
import { useMst } from "../../setup/root"
import { ETemplateVersionStatus } from "../../types/enums"

export const useTemplateVersions = ({
  activityId,
  permitTypeId,
  customErrorMessage,
  status,
  earlyAccess = false,
  isPublic = false,
}: {
  activityId?: string
  permitTypeId?: string
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

  let templateVersions = getTemplateVersionsByStatus(status, earlyAccess, isPublic) as ITemplateVersion[]
  if (activityId) {
    templateVersions = getTemplateVersionsByActivityId(activityId, status, earlyAccess, isPublic) as ITemplateVersion[]
  } else if (permitTypeId) {
    templateVersions = (templateVersions as ITemplateVersion[]).filter(
      (tv) => tv.denormalizedTemplateJson?.permitType?.id === permitTypeId
    )
  }
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      const errorMessage = customErrorMessage ?? t("errors.fetchTemplateVersions")
      try {
        const isSuccess = await fetchTemplateVersions(activityId, status, earlyAccess, isPublic, permitTypeId)

        if (isSuccess) {
          setError(null)
        } else {
          setError(new Error(errorMessage))
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(errorMessage))
      }
    })()
  }, [activityId, permitTypeId, currentSandbox?.id])

  return { templateVersions, error, isLoading }
}
