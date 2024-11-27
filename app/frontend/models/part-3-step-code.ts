import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { Part3StepCodeChecklistModel } from "./part-3-step-code-checklist"

export const Part3StepCodeModel = types
  .model("Part3StepCodeModel", {
    id: types.identifier,
    checklistsMap: types.map(Part3StepCodeChecklistModel),
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
  .views((self) => ({}))
  .actions((self) => ({}))

export interface IPart3StepCode extends Instance<typeof Part3StepCodeModel> {}
