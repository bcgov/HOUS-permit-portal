import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../setup/root"

export function useAutoComplianceModuleConfigurations({ customErrorMessage }: { customErrorMessage?: string } = {}) {
  const { t } = useTranslation()
  const { requirementBlockStore } = useMst()
  const { fetchAutoComplianceModuleConfigurations } = requirementBlockStore
  const autoComplianceModuleConfigurations = requirementBlockStore.autoComplianceModuleConfigurations
  const [error, setError] = React.useState<Error | undefined>()

  useEffect(() => {
    if (!autoComplianceModuleConfigurations && !requirementBlockStore.isAutoComplianceModuleOptionsLoading && !error) {
      ;(async () => {
        const errorMessage = customErrorMessage ?? t("errors.fetchAutoComplianceModuleConfigurations")
        try {
          const result = await fetchAutoComplianceModuleConfigurations()

          if (!result) {
            throw new Error(errorMessage)
          }
        } catch (error) {
          setError(error instanceof Error ? error : new Error(errorMessage))
        }
      })()
    }
  }, [autoComplianceModuleConfigurations, requirementBlockStore.isAutoComplianceModuleOptionsLoading])

  return { autoComplianceModuleConfigurations, error }
}
