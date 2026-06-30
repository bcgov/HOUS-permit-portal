import { applySnapshot, flow, getSnapshot, Instance, types } from "mobx-state-tree"
import * as R from "ramda"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import { EEnergyStep, EStepCodeChecklistStage, EStepCodeType, EZeroCarbonStep } from "../types/enums"
import { Part3StepCodeChecklistModel } from "./part-3-step-code-checklist"
import { StepCodeBaseFields } from "./step-code-base"

export const Part3StepCodeModel = types.snapshotProcessor(
  types
    .compose(
      "Part3StepCodeModel",
      StepCodeBaseFields,
      types.model({
        id: types.identifier,
        type: types.literal(EStepCodeType.part3StepCode),
        checklist: types.maybeNull(types.late(() => Part3StepCodeChecklistModel)),
        checklistsMap: types.map(Part3StepCodeChecklistModel),
        zeroCarbonSteps: types.array(types.enumeration(Object.values(EZeroCarbonStep))),
        energySteps: types.array(types.enumeration(Object.values(EEnergyStep))),
        isFullyLoaded: types.optional(types.boolean, false),
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
      get currentChecklist() {
        const stage = self.currentStage || EStepCodeChecklistStage.preConstruction
        return self.checklists.find((checklist) => checklist.stage === stage) || self.checklist
      },
      get primaryChecklist() {
        return self.currentChecklist
      },
      get checklistForPdf() {
        return self.currentChecklist
      },
      get isComplete() {
        return self.currentChecklist?.isAllComplete
      },
      get targetPath() {
        if (self.permitApplicationId) {
          return `/permit-applications/${self.permitApplicationId}/edit/part-3-step-code`
        }
        return `/part-3-step-code/${self.id}`
      },
    }))
    .actions((self) => ({
      __mergeUpdate(resourceData: Record<string, unknown>) {
        applySnapshot(self, R.mergeDeepLeft(resourceData, getSnapshot(self)) as any)
      },
      createChecklist: flow(function* (values: Record<string, any>) {
        const response = yield self.environment.api.createPart3Checklist(self.id, values)
        if (response.ok) {
          self.mergeUpdate(response.data.data, "checklistsMap")
          return response.data.data
        }
      }),
    })),
  {
    preProcessor(snapshot: any) {
      const processed = { ...snapshot }
      const map: Record<string, any> = {}

      if (Array.isArray(processed.checklists)) {
        processed.checklists.forEach((checklist: any) => {
          if (checklist?.id) map[checklist.id] = checklist
        })
        delete processed.checklists
      }

      if (processed.checklist?.id) {
        map[processed.checklist.id] = processed.checklist
      }

      processed.checklistsMap = {
        ...(processed.checklistsMap || {}),
        ...map,
      }
      return processed
    },
  }
)

export interface IPart3StepCode extends Instance<typeof Part3StepCodeModel> {}
