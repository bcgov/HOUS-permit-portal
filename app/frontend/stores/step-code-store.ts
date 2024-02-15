import { Instance, flow, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { StepCodeModel } from "../models/step-code"

export const StepCodeStoreModel = types
  .model("StepCodeStore", {
    stepCodesMap: types.map(StepCodeModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({}))
  .actions((self) => ({
    createStepCode: flow(function* (values) {
      const response: any = yield self.environment.api.createStepCode(values)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        return true
      }
    }),
  }))

export interface IStepCodeStore extends Instance<typeof StepCodeStoreModel> {}
