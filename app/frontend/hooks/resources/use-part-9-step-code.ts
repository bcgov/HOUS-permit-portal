import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IPart9StepCode } from "../../models/part-9-step-code"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePart9StepCode = () => {
  const { stepCodeStore } = useMst()
  const { fetchPart9StepCode, getStepCode, setCurrentStepCode } = stepCodeStore
  const { stepCodeId, permitApplicationId } = useParams()
  const [isLoading, setIsLoading] = useState(!permitApplicationId)

  useEffect(() => {
    const loadStepCode = async () => {
      setIsLoading(true)
      if (isUUID(stepCodeId)) {
        let stepCode = getStepCode(stepCodeId) as IPart9StepCode
        if (!stepCode || !(stepCode as any).isFullyLoaded) {
          stepCode = await fetchPart9StepCode(stepCodeId)
        }
        if (stepCode) {
          setCurrentStepCode(stepCode.id)
        }
      } else {
        // No valid stepCodeId and no permitApplicationId in route: reset current
        setCurrentStepCode(null)
      }
      setIsLoading(false)
    }

    if (!permitApplicationId) {
      loadStepCode()
    } else {
      setIsLoading(false)
    }
  }, [permitApplicationId, stepCodeId, fetchPart9StepCode, getStepCode, setCurrentStepCode])

  const currentStepCode = stepCodeStore.currentStepCode as IPart9StepCode
  return { currentStepCode, isLoading }
}
