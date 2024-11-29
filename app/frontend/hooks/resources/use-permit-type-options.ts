import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitType } from "../../models/permit-classification"
import { useMst } from "../../setup/root"
import { IOption } from "../../types/types"

export function usePermitTypeOptions() {
  const { t } = useTranslation()
  const { permitClassificationStore } = useMst()
  const { fetchPermitTypeOptions } = permitClassificationStore
  const [permitTypeOptions, setPermitTypeOptions] = React.useState<IOption<IPermitType>[] | null>(null)
  const [error, setError] = React.useState<Error | undefined>()

  useEffect(() => {
    if (!permitTypeOptions && !error) {
      ;(async () => {
        try {
          const permitTypeOptions = await fetchPermitTypeOptions()

          if (!permitTypeOptions) {
            throw new Error(t("errors.fetchPermitTypeOptions"))
          } else {
            setError(null)
          }

          setPermitTypeOptions(permitTypeOptions)
        } catch (error) {
          setError(error instanceof Error ? error : new Error(t("errors.fetchPermitTypeOptions")))
        }
      })()
    }
  }, [])

  return { permitTypeOptions, error }
}
