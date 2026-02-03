import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitType } from "../../models/permit-classification"
import { useMst } from "../../setup/root"
import { IOption } from "../../types/types"

interface IUsePermitTypeOptionsProps {
  publishedOnly?: boolean
  jurisdictionId?: string
}

export function usePermitTypeOptions(props?: IUsePermitTypeOptionsProps) {
  const { t } = useTranslation()
  const { permitClassificationStore } = useMst()
  const { fetchPermitTypeOptions } = permitClassificationStore
  const [permitTypeOptions, setPermitTypeOptions] = React.useState<IOption<IPermitType>[] | null>(null)
  const [error, setError] = React.useState<Error | undefined>()

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const permitTypeOptions = await fetchPermitTypeOptions(props?.publishedOnly, null, null, props?.jurisdictionId)

        if (!permitTypeOptions) {
          throw new Error(t("errors.fetchPermitTypeOptions"))
        }
        if (isMounted) setError(null)

        if (isMounted) setPermitTypeOptions(permitTypeOptions)
      } catch (error) {
        if (isMounted) setError(error instanceof Error ? error : new Error(t("errors.fetchPermitTypeOptions")))
      }
    })()

    return () => {
      isMounted = false
    }
  }, [props?.publishedOnly, props?.jurisdictionId])

  return { permitTypeOptions, error }
}
