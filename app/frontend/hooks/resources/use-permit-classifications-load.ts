import { useEffect } from "react"
import { useMst } from "../../setup/root"

export const usePermitClassificationsLoad = (onlyEnabled: boolean = true) => {
  const {
    permitClassificationStore: { isLoaded, fetchPermitClassifications },
  } = useMst()

  useEffect(() => {
    const fetch = async () => await fetchPermitClassifications(onlyEnabled)
    !isLoaded && fetch()
  }, [isLoaded, onlyEnabled])

  return { isLoaded }
}
