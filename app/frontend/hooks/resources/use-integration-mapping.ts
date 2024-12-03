import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IIntegrationMapping } from "../../models/integration-mapping"
import { ITemplateVersion } from "../../models/template-version"

interface IOptions {
  templateVersion: ITemplateVersion | undefined
  jurisdictionId: string | undefined
  customErrorMessage?: string
}

/**
 * Custom React Hook to fetch and manage the jurisdiction integration requirements mapping.
 *
 * @param {IOptions} options - The options for fetching the jurisdiction integration requirements mapping.
 * @param {ITemplateVersion | undefined} options.templateVersion - The template version MST model instance.
 * @param {string | undefined} options.jurisdictionId - The ID of the jurisdiction.
 * @param {string | undefined} options.customErrorMessage - Custom error message to be used when an error occurs (optional).
 *
 * @returns {Object} - The jurisdiction integration requirements mapping and any error that occurred during fetching.
 * @returns {IIntegrationMapping | undefined} integrationMapping - The jurisdiction
 * integration requirements mapping MST model instance.
 * @returns {Error | undefined} error - Any error that occurred during fetching.
 *
 * @example
 * const { integrationMapping, error } = useIntegrationMapping({
 *   templateVersion: someTemplateVersion,
 *   jurisdictionId: '123',
 *   customErrorMessage: 'An error occurred while fetching the jurisdiction integration requirements mapping.',
 * });
 */

export const useIntegrationMapping = ({
  templateVersion,
  jurisdictionId,
  customErrorMessage,
}: IOptions): {
  error?: Error
  integrationMapping?: IIntegrationMapping
} => {
  const integrationMapping = templateVersion?.getIntegrationMapping(jurisdictionId)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()
  const errorMessage = customErrorMessage ?? t("errors.fetchIntegrationMapping")

  useEffect(() => {
    if (jurisdictionId && templateVersion) {
      ;(async () => {
        try {
          const integrationMapping = await templateVersion.fetchIntegrationMapping(jurisdictionId)

          if (!integrationMapping) {
            setError(new Error(errorMessage))
          } else {
            setError(null)
          }
        } catch (e) {
          setError(e instanceof Error ? e : new Error(errorMessage))
        }
      })()
    }
  }, [templateVersion?.id, jurisdictionId])

  return { integrationMapping, error }
}
