import { flow } from "mobx"
import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { EEnergyStep, EZeroCarbonStep } from "../types/enums"
import { Part9StepCodeChecklistModel } from "./part-9-step-code-checklist"

export const Part9StepCodeType = "Part9StepCode"

export const Part9StepCodeModel = types
  .model("Part9StepCodeModel", {
    id: types.identifier,
    type: types.literal(Part9StepCodeType),
    checklistsMap: types.map(Part9StepCodeChecklistModel),
    zeroCarbonSteps: types.array(types.enumeration(Object.values(EZeroCarbonStep))),
    energySteps: types.array(types.enumeration(Object.values(EEnergyStep))),
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
  .views((self) => ({
    get checklistForPdf() {
      return self.preConstructionChecklist
    },
    get isComplete() {
      return self.preConstructionChecklist?.isComplete
    },
  }))
  .actions((self) => ({
    updateChecklist: flow(function* (id, values) {
      const response = yield self.environment.api.updatePart9Checklist(id, values)
      if (response.ok) {
        self.mergeUpdate(response.data.data, "checklistsMap")
        return true
      }
    }),
  }))

export interface IPart9StepCode extends Instance<typeof Part9StepCodeModel> {}
