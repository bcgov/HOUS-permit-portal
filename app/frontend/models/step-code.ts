import { Instance, types } from "mobx-state-tree"

export const StepCodeModel = types
  .model("StepCodeModel", {
    id: types.identifier,
  })
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IStepCode extends Instance<typeof StepCodeModel> {}
