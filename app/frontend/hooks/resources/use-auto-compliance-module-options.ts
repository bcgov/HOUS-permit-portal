import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../setup/root"

export function useAutoComplianceModuleOptions({ customErrorMessage }: { customErrorMessage?: string } = {}) {
  const { t } = useTranslation()
  const { requirementBlockStore } = useMst()
  const { fetchAutoComplianceModuleOptions } = requirementBlockStore
  const autoComplianceModuleOptions = requirementBlockStore.autoComplianceModuleOptions
  const [error, setError] = React.useState<Error | undefined>()

  useEffect(() => {
    if (!autoComplianceModuleOptions && !requirementBlockStore.isAutoComplianceModuleOptionsLoading && !error) {
      ;(async () => {
        const errorMessage = customErrorMessage ?? t("errors.fetchAutoComplianceModuleOptions")
        try {
          const result = await fetchAutoComplianceModuleOptions()

          if (!result) {
            throw new Error(errorMessage)
          }
        } catch (error) {
          setError(error instanceof Error ? error : new Error(errorMessage))
        }
      })()
    }
  }, [autoComplianceModuleOptions, requirementBlockStore.isAutoComplianceModuleOptionsLoading])

  return { autoComplianceModuleOptions, error }
}
