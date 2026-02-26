import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../models/template-version"
import { useMst } from "../../setup/root"
import { ETemplateVersionStatus } from "../../types/enums"

export const useTemplateVersions = ({
  customErrorMessage,
  status,
  earlyAccess = false,
  isPubliclyPreviewable = false,
}: {
  customErrorMessage?: string
  status?: ETemplateVersionStatus
  earlyAccess?: boolean
  isPubliclyPreviewable?: boolean
}) => {
  const [error, setError] = useState<Error | undefined>(undefined)
  const { templateVersionStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore
  const { getTemplateVersionsByStatus, fetchTemplateVersions, isLoading } = templateVersionStore
  status ??= currentSandbox?.templateVersionStatusScope || ETemplateVersionStatus.published

  const templateVersions = getTemplateVersionsByStatus(status, earlyAccess, isPubliclyPreviewable) as ITemplateVersion[]
  const { t } = useTranslation()

  useEffect(() => {
    ;(async () => {
      const errorMessage = customErrorMessage ?? t("errors.fetchTemplateVersions")
      try {
        const isSuccess = await fetchTemplateVersions(status, earlyAccess, isPubliclyPreviewable)

        if (isSuccess) {
          setError(null)
        } else {
          setError(new Error(errorMessage))
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(errorMessage))
      }
    })()
  }, [currentSandbox?.id])

  return { templateVersions, error, isLoading }
}
