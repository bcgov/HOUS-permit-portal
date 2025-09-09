import { useMst } from "../../setup/root"

export const usePart9StepCode = () => {
  const { stepCodeStore } = useMst()
  const { currentStepCode } = stepCodeStore

  // current step coe should be set by the permit application hook.
  // When standalone part 9 is supported, we need to set the current step code here.

  return { currentStepCode }
}
