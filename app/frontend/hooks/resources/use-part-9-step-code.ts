import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { IPart9StepCode } from "../../models/part-9-step-code"
import { useMst } from "../../setup/root"
import { EStepCodeChecklistStage } from "../../types/enums"
import { isUUID } from "../../utils/utility-functions"

export const usePart9StepCode = () => {
  const { stepCodeStore, permitApplicationStore } = useMst()
  const { currentPermitApplication } = permitApplicationStore
  const { fetchPart9StepCode, getStepCode, setCurrentStepCode } = stepCodeStore
  const { stepCodeId, permitApplicationId, stage } = useParams()
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
      } else if (stepCodeId) {
        // No valid stepCodeId and no permitApplicationId in route: reset current
        setCurrentStepCode(null)
      }
      setIsLoading(false)
    }

    if (!permitApplicationId) {
      loadStepCode()
    } else {
      const paStepCode = currentPermitApplication?.stepCode
      if (paStepCode && !paStepCode.isDiscarded) {
        // HUB-5145: This permit route selects the StepCode report family. The
        // model should resolve currentChecklist from StepCode.currentStage, or
        // from an explicit route stage/checklist id when present.
        setCurrentStepCode(paStepCode.id)
      }
      setIsLoading(false)
    }
  }, [permitApplicationId, stepCodeId, fetchPart9StepCode, getStepCode, setCurrentStepCode, currentPermitApplication])

  const currentStepCode = stepCodeStore.currentStepCode as IPart9StepCode

  useEffect(() => {
    if (!currentStepCode) return
    if (!Object.values(EStepCodeChecklistStage).includes(stage as EStepCodeChecklistStage)) return
    // Re-apply when a StepCode merge resets currentStage away from the route stage.
    if (currentStepCode.currentStage === stage) return
    currentStepCode.setCurrentStage(stage as EStepCodeChecklistStage)
  }, [currentStepCode, stage, currentStepCode?.currentStage])

  const checklist = currentStepCode?.currentChecklist

  useEffect(() => {
    if (!checklist || checklist.isLoaded) return

    checklist.load()
  }, [checklist?.id, checklist?.isLoaded])

  return { currentStepCode, checklist, isLoading }
}
