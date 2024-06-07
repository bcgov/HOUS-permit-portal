import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IJurisdictionIntegrationRequirementsMapping } from "../../models/jurisdiction-integration-requirements-mapping"
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
 * @returns {IJurisdictionIntegrationRequirementsMapping | undefined} jurisdictionIntegrationRequirementsMapping - The jurisdiction
 * integration requirements mapping MST model instance.
 * @returns {Error | undefined} error - Any error that occurred during fetching.
 *
 * @example
 * const { jurisdictionIntegrationRequirementsMapping, error } = useJurisdictionIntegrationRequirementsMapping({
 *   templateVersion: someTemplateVersion,
 *   jurisdictionId: '123',
 *   customErrorMessage: 'An error occurred while fetching the jurisdiction integration requirements mapping.',
 * });
 */

export const useJurisdictionIntegrationRequirementsMapping = ({
  templateVersion,
  jurisdictionId,
  customErrorMessage,
}: IOptions): {
  error?: Error
  jurisdictionIntegrationRequirementsMapping?: IJurisdictionIntegrationRequirementsMapping
} => {
  const jurisdictionIntegrationRequirementsMapping =
    templateVersion?.getJurisdictionIntegrationRequirementsMapping(jurisdictionId)
  const [error, setError] = useState<Error | undefined>(undefined)
  const { t } = useTranslation()
  const errorMessage = customErrorMessage ?? t("errors.fetchJurisdictionIntegrationRequirementsMapping")

  useEffect(() => {
    if (jurisdictionId && templateVersion) {
      ;(async () => {
        try {
          const integrationRequirementsMapping =
            await templateVersion.fetchJurisdictionIntegrationRequirementsMapping(jurisdictionId)

          if (!integrationRequirementsMapping) {
            setError(new Error(errorMessage))
          }
        } catch (e) {
          setError(e instanceof Error ? e : new Error(errorMessage))
        }
      })()
    }
  }, [templateVersion?.id, jurisdictionId])

  return { jurisdictionIntegrationRequirementsMapping, error }
}
