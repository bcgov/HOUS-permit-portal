import { flow } from "mobx"
import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withMerge } from "../lib/with-merge"
import { withRootStore } from "../lib/with-root-store"
import {
  EEnergyStep,
  EStepCodeChecklistStage,
  EStepCodeStageStatus,
  EStepCodeType,
  EZeroCarbonStep,
} from "../types/enums"
import { stageStatusFor } from "../utils/step-code-stage-status"
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
        return self.checklists.find((checklist) => checklist.stage === stage)
      },
      get preConstructionChecklist() {
        return self.currentChecklist
      },
    }))
    .views((self) => ({
      get checklistForPdf() {
        return self.currentChecklist
      },
      stageStatus(stage: EStepCodeChecklistStage = self.currentStage) {
        return stageStatusFor(stage, self.checklists, self.stageCompletions)
      },
      isStageComplete(stage: EStepCodeChecklistStage = self.currentStage) {
        return self.stageStatus(stage) === EStepCodeStageStatus.complete
      },
      get isComplete() {
        return self.isStageComplete()
      },
      get targetPath() {
        if (self.permitApplicationId) {
          return `/permit-applications/${self.permitApplicationId}/edit/part-9-step-code`
        }
        return `/part-9-step-code/${self.id}`
      },
    }))
    .actions((self) => ({
      updateChecklist: flow(function* (id: string, values: Record<string, any>, options?: Record<string, any>) {
        const response = yield self.environment.api.updatePart9Checklist(id, values, options)
        if (response.ok) {
          self.mergeUpdate(response.data.data, "checklistsMap")
          self.markReportDocumentsStale()
          return true
        }
      }),
      createChecklist: flow(function* (values: Record<string, any>) {
        const response = yield self.environment.api.createPart9Checklist(self.id, values)
        if (response.ok) {
          self.mergeUpdate(response.data.data, "checklistsMap")
          return response.data.data
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
