import { flow } from "mobx"
import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { EEnergyStep, EStepCodeType, EZeroCarbonStep } from "../types/enums"
import { Part9StepCodeChecklistModel } from "./part-9-step-code-checklist"
import { StepCodeBaseFields } from "./step-code-base"

export const Part9StepCodeModel = types.snapshotProcessor(
  types
    .compose(
      "Part9StepCodeModel",
      StepCodeBaseFields,
      types.model({
        id: types.identifier,
        type: types.literal(EStepCodeType.part9StepCode),
        checklistsMap: types.map(Part9StepCodeChecklistModel),
        zeroCarbonSteps: types.array(types.enumeration(Object.values(EZeroCarbonStep))),
        energySteps: types.array(types.enumeration(Object.values(EEnergyStep))),
        permitApplicationId: types.maybeNull(types.string),
      })
    )
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
      get primaryChecklist() {
        return self.checklists[0]
      },
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
      get targetPath() {
        if (self.permitApplicationId) {
          return `/permit-applications/${self.permitApplicationId}/edit/part-9-step-code`
        }
        return `/part-9-step-code/${self.id}`
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
    })),
  {
    preProcessor(snapshot: any) {
      const processed = { ...snapshot }
      if (Array.isArray(processed.checklists)) {
        const map = processed.checklists.reduce((acc: Record<string, any>, checklist: any) => {
          if (checklist && checklist.id) acc[checklist.id] = checklist
          return acc
        }, {})
        processed.checklistsMap = map
        delete processed.checklists
      } else if (processed.checklistsMap == null) {
        processed.checklistsMap = {}
      }
      return processed
    },
  }
)

export interface IPart9StepCode extends Instance<typeof Part9StepCodeModel> {}
