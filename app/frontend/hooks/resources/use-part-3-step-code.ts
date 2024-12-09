import { IPart3StepCode, Part3StepCodeType } from "../../models/part-3-step-code"
import { useMst } from "../../setup/root"

function isPart3StepCode(model): model is IPart3StepCode {
  return model?.type === Part3StepCodeType
}

export const usePart3StepCode = () => {
  const { stepCodeStore } = useMst()
  const stepCode = stepCodeStore.currentStepCode as IPart3StepCode
  const checklist = stepCode?.checklist

  return { stepCode, checklist }
}
