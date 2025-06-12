import { IPart9StepCode } from "../../models/part-9-step-code"
import { useMst } from "../../setup/root"

export const usePart9StepCode = () => {
  const { stepCodeStore, permitApplicationStore } = useMst()
  const stepCode = stepCodeStore.currentStepCode as IPart9StepCode
  const { isLoadingCurrentPermitApplication: isLoading } = permitApplicationStore

  return { stepCode, isLoading }
}
