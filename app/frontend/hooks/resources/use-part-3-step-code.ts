import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IPart3StepCode } from "../../models/part-3-step-code"
import { useMst } from "../../setup/root"
import { isUUID } from "../../utils/utility-functions"

export const usePart3StepCode = () => {
  const { permitApplicationId, stepCodeId } = useParams()
  const { stepCodeStore, permitApplicationStore } = useMst()
  const { currentPermitApplication } = permitApplicationStore
  const { fetchPart3StepCode, getStepCode, setCurrentStepCode } = stepCodeStore
  const [isLoading, setIsLoading] = useState(!permitApplicationId)

  useEffect(() => {
    const loadStepCode = async () => {
      setIsLoading(true)
      if (isUUID(stepCodeId)) {
        let stepCode = getStepCode(stepCodeId) as IPart3StepCode
        if (!stepCode || !stepCode.isFullyLoaded) {
          stepCode = await fetchPart3StepCode(stepCodeId)
        }
        if (stepCode) {
          setCurrentStepCode(stepCode.id)
        }
      } else if (currentPermitApplication) {
        setCurrentStepCode(currentPermitApplication.stepCode?.id)
      }
      setIsLoading(false)
    }

    if (!permitApplicationId) {
      loadStepCode()
    } else {
      setIsLoading(false)
    }
  }, [permitApplicationId, stepCodeId, fetchPart3StepCode, getStepCode, setCurrentStepCode, currentPermitApplication])

  const stepCode = stepCodeStore.currentStepCode as IPart3StepCode
  const checklist = stepCode?.checklist

  return { stepCode, checklist, isLoading }
}
