import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IPart3StepCode } from "../../models/part-3-step-code"
import { useMst } from "../../setup/root"
import { EStepCodeChecklistStage } from "../../types/enums"
import { isUUID } from "../../utils/utility-functions"

export const usePart3StepCode = () => {
  const { permitApplicationId, stepCodeId, stage } = useParams()
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
      const paStepCode = currentPermitApplication?.stepCode
      if (paStepCode && !paStepCode.isDiscarded) {
        // HUB-5145: Permit routes select the StepCode report family. The model
        // should resolve currentChecklist from StepCode.currentStage, or from an
        // explicit route stage/checklist id when present.
        setCurrentStepCode(paStepCode.id)
      }
      setIsLoading(false)
    }
  }, [permitApplicationId, stepCodeId, fetchPart3StepCode, getStepCode, setCurrentStepCode, currentPermitApplication])

  const currentStepCode = stepCodeStore.currentStepCode as IPart3StepCode

  useEffect(() => {
    if (currentStepCode && Object.values(EStepCodeChecklistStage).includes(stage as EStepCodeChecklistStage)) {
      currentStepCode.setCurrentStage(stage as EStepCodeChecklistStage)
    }
  }, [currentStepCode, stage])

  const checklist = currentStepCode?.currentChecklist

  return { currentStepCode, checklist, isLoading }
}
