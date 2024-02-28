import { flow } from "mobx"
import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { StepCodeChecklistModel } from "./step-code-checklist"

export const StepCodeModel = types
  .model("StepCodeModel", {
    id: types.identifier,
    checklistsMap: types.map(StepCodeChecklistModel),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .extend(withMerge())
  .views((self) => ({
    get checklists() {
      return Array.from(self.checklistsMap.values())
    },
    getChecklist(id: string) {
      return self.checklistsMap.get(id)
    },
  }))
  .views((self) => ({
    get preConstructionChecklist() {
      return self.checklists[0]
    },
  }))
  .actions((self) => ({
    updateStepCodeChecklist: flow(function* (id, values) {
      const response = yield self.environment.api.updateStepCodeChecklist(id, values)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "checklistsMap")
        return true
      }
    }),
  }))

export interface IStepCode extends Instance<typeof StepCodeModel> {}
