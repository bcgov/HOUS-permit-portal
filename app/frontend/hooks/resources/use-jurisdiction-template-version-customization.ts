import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../models/template-version"
import { useMst } from "../../setup/root"

interface IOptions {
  templateVersion: ITemplateVersion | undefined
  jurisdictionId: string | undefined
  customErrorMessage?: string
}

export const useJurisdictionTemplateVersionCustomization = ({
  templateVersion,
  jurisdictionId,
  customErrorMessage,
}: IOptions) => {
  const jurisdictionTemplateVersionCustomization =
    templateVersion?.getJurisdictionTemplateVersionCustomization(jurisdictionId)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore

  const { t } = useTranslation()

  useEffect(() => {
    if (jurisdictionId && templateVersion) {
      ;(async () => {
        try {
          const response = await templateVersion.fetchJurisdictionTemplateVersionCustomization(jurisdictionId)

          // Only error out if the response is not ok and not a 404
          // Because all jurisdictions are not guaranteed to have any customization
          // and we don't want to show an error message in that case
          if (!response.ok && response.status !== 404) {
            setError(new Error(customErrorMessage ?? t("errors.fetchJurisdictionTemplateVersionCustomization")))
          } else {
            setError(null)
          }
        } catch (e) {
          setError(
            e instanceof Error
              ? e
              : new Error(customErrorMessage ?? t("errors.fetchJurisdictionTemplateVersionCustomization"))
          )
        }
      })()
    }
  }, [templateVersion?.id, jurisdictionId, currentSandbox?.id])

  return { jurisdictionTemplateVersionCustomization, error }
}
