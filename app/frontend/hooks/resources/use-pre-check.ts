import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IPreCheck } from "../../models/pre-check"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePreCheck = () => {
  const { preCheckId, permitApplicationId } = useParams()
  const { preCheckStore } = useMst()
  const { fetchPreCheck, preChecksMap, createPreCheck } = preCheckStore
  const [isLoading, setIsLoading] = useState(true)
  const [foundPreCheckId, setFoundPreCheckId] = useState<string | null>(null)

  useEffect(() => {
    const loadPreCheck = async () => {
      setIsLoading(true)
      if (isUUID(preCheckId)) {
        let preCheck = preChecksMap.get(preCheckId) as IPreCheck
        if (!preCheck) {
          preCheck = await fetchPreCheck(preCheckId)
        }
      } else if (isUUID(permitApplicationId)) {
        const response = await createPreCheck({ permitApplicationId })
        if (response.ok && response.data) {
          setFoundPreCheckId(response.data.id)
        }
      }
      setIsLoading(false)
    }

    loadPreCheck()
  }, [preCheckId, permitApplicationId, fetchPreCheck, preChecksMap, createPreCheck])

  const effectivePreCheckId = preCheckId || foundPreCheckId
  const currentPreCheck = effectivePreCheckId ? preChecksMap.get(effectivePreCheckId) : null

  return { currentPreCheck, isLoading }
}
