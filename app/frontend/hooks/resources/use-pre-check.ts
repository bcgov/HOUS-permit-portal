import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IPreCheck } from "../../models/pre-check"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePreCheck = () => {
  const { preCheckId } = useParams()
  const { preCheckStore } = useMst()
  const { fetchPreCheck, preChecksMap } = preCheckStore
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreCheck = async () => {
      setIsLoading(true)
      if (isUUID(preCheckId)) {
        let preCheck = preChecksMap.get(preCheckId) as IPreCheck
        if (!preCheck) {
          preCheck = await fetchPreCheck(preCheckId)
        }
      }
      setIsLoading(false)
    }

    loadPreCheck()
  }, [preCheckId, fetchPreCheck, preChecksMap])

  const currentPreCheck = preCheckId ? preChecksMap.get(preCheckId) : null

  return { currentPreCheck, isLoading }
}
