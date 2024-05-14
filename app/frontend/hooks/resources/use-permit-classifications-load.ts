import { useEffect } from "react"
import { useMst } from "../../setup/root"

export const usePermitClassificationsLoad = () => {
  const {
    permitClassificationStore: { isLoaded, fetchPermitClassifications },
  } = useMst()

  useEffect(() => {
    const fetch = async () => await fetchPermitClassifications()
    !isLoaded && fetch()
  }, [isLoaded])

  return { isLoaded }
}
