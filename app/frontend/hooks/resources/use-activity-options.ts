import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IActivity } from "../../models/permit-classification"
import { useMst } from "../../setup/root"
import { IOption } from "../../types/types"

export function useActivityOptions({ customErrorMessage }: { customErrorMessage?: string }) {
  const { t } = useTranslation()
  const { permitClassificationStore } = useMst()
  const { fetchActivityOptions } = permitClassificationStore
  const [activityOptions, setActivityOptions] = React.useState<IOption<IActivity>[] | null>(null)
  const [error, setError] = React.useState<Error | undefined>()

  useEffect(() => {
    if (!activityOptions && !error) {
      ;(async () => {
        const errorMessage = customErrorMessage ?? t("errors.fetchPermitTypeOptions")
        try {
          const options = await fetchActivityOptions()

          if (!options) {
            throw new Error(errorMessage)
          }

          setActivityOptions(options)
        } catch (error) {
          setError(error instanceof Error ? error : new Error(errorMessage))
        }
      })()
    }
  }, [])

  return { activityOptions, error }
}
