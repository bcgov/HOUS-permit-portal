import { IPart3StepCode } from "../../models/part-3-step-code"
import { useMst } from "../../setup/root"

export const usePart3StepCode = () => {
  const { stepCodeStore } = useMst()
  const stepCode = stepCodeStore.currentStepCode as IPart3StepCode
  const checklist = stepCode?.checklist

  return { stepCode, checklist }
}
