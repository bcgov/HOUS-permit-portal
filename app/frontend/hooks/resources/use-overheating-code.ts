import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IOverheatingCode } from "../../models/overheating-code"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const useOverheatingCode = () => {
  const { overheatingCodeId } = useParams()
  const { overheatingCodeStore } = useMst()
  const { fetchOverheatingCode, overheatingCodesMap } = overheatingCodeStore
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOverheatingCode = async () => {
      setIsLoading(true)
      if (isUUID(overheatingCodeId)) {
        let overheatingCode = overheatingCodesMap.get(overheatingCodeId) as IOverheatingCode
        if (!overheatingCode) {
          overheatingCode = await fetchOverheatingCode(overheatingCodeId)
        }
      }
      setIsLoading(false)
    }

    loadOverheatingCode()
  }, [overheatingCodeId, fetchOverheatingCode, overheatingCodesMap])

  const currentOverheatingCode = overheatingCodeId ? overheatingCodesMap.get(overheatingCodeId) : null

  return { currentOverheatingCode, isLoading }
}
