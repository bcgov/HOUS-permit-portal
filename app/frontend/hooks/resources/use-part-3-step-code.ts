import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IPart3StepCode } from "../../models/part-3-step-code"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePart3StepCode = () => {
  const { stepCodeId } = useParams()
  const { stepCodeStore } = useMst()
  const { fetchPart3StepCode, getStepCode, setCurrentStepCode } = stepCodeStore
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStepCode = async () => {
      setIsLoading(true)
      if (isUUID(stepCodeId)) {
        let stepCode = getStepCode(stepCodeId)
        if (!stepCode) {
          stepCode = await fetchPart3StepCode(stepCodeId)
        }
        if (stepCode) {
          setCurrentStepCode(stepCode.id)
        }
      }
      setIsLoading(false)
    }

    loadStepCode()
  }, [stepCodeId, fetchPart3StepCode, getStepCode, setCurrentStepCode])

  const stepCode = stepCodeStore.currentStepCode as IPart3StepCode
  const checklist = stepCode?.checklist

  return { stepCode, checklist, isLoading }
}
