import { Instance, flow, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { IStepCode, StepCodeModel } from "../models/step-code"
import { IStepCodeSelectOptions } from "../types/types"

export const StepCodeStoreModel = types
  .model("StepCodeStore", {
    stepCodesMap: types.map(StepCodeModel),
    selectOptions: types.frozen<IStepCodeSelectOptions>(),
    isLoaded: types.maybeNull(types.boolean),
    currentStepCode: types.maybeNull(types.reference(StepCodeModel)),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get stepCodes() {
      return Array.from(self.stepCodesMap.values())
    },
    getStepCode(id: string) {
      return self.stepCodesMap.get(id)
    },
  }))
  .actions((self) => ({
    __beforeMergeUpdate(stepCode) {
      const checklistsMap = stepCode.checklists.reduce((checklistsMap, checklist) => {
        checklistsMap[checklist.id] = checklist
        return checklistsMap
      }, {})
      return R.mergeRight(stepCode, {
        checklistsMap,
      })
    },
    setCurrentStepCode(stepCode?: IStepCode) {
      self.currentStepCode = stepCode
    },
    fetchStepCodes: flow(function* () {
      const response = yield self.environment.api.fetchStepCodes()
      if (response.ok) {
        self.mergeUpdateAll(response.data.data, "stepCodesMap")
        self.selectOptions = response.data.meta.selectOptions
      }
      self.isLoaded = true
    }),
    createStepCode: flow(function* (values) {
      const response = yield self.environment.api.createStepCode(values)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "stepCodesMap")
        self.currentStepCode = response.data.data.id
        return true
      }
    }),
    deleteStepCode: flow(function* () {
      const response = yield self.environment.api.deleteStepCode(self.currentStepCode.id)
      if (response.ok) {
        self.stepCodesMap.delete(self.currentStepCode.id)
        self.currentStepCode = null
      }
    }),
  }))

export interface IStepCodeStore extends Instance<typeof StepCodeStoreModel> {}
