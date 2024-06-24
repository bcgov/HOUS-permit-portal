import queryString from "query-string"
import { useEffect } from "react"
import { useMst } from "../setup/root"

export const useFlashQueryParam = () => {
  const { uiStore } = useMst()

  useEffect(() => {
    uiStore.showQueryParamFlash()
  }, [queryString.parse(location.search)])
}
