import { flow, toGenerator, types } from "mobx-state-tree"
import { EStepCodeChecklistStage, EStepCodeStageStatus } from "../types/enums"
import { JurisdictionModel } from "./jurisdiction"

// Define the base fields shared between Part3 and Part9 StepCode models
export const StepCodeBaseFields = types
  .model("StepCodeBaseFields", {
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    discardedAt: types.maybeNull(types.Date),
    title: types.maybeNull(types.string),
    referenceNumber: types.maybeNull(types.string),
    fullAddress: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    jurisdictionName: types.maybeNull(types.string),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    permitDate: types.maybeNull(types.Date),
    // HUB-5145: `phase` is legacy stage-like metadata. Introduce currentStage
    // on StepCode for selection; keep lifecycle identity on checklist.stage.
    phase: types.maybeNull(types.string),
    currentStage: types.optional(
      types.enumeration<EStepCodeChecklistStage[]>(Object.values(EStepCodeChecklistStage)),
      EStepCodeChecklistStage.preConstruction
    ),
    permitProjectTitle: types.maybeNull(types.string),
    // API snapshot for list/index rows without checklists loaded. Detail UIs
    // should prefer stageStatus()/isStageComplete() which derive from checklists.
    stageCompletions: types.optional(
      types.array(
        types.frozen<{
          stage: EStepCodeChecklistStage
          status: EStepCodeStageStatus
          stageCompletedAt: Date | null
        }>()
      ),
      []
    ),
  })
  .views((self) => ({
    get isDiscarded(): boolean {
      return self.discardedAt !== null
    },
    isStageComplete(stage: EStepCodeChecklistStage = self.currentStage) {
      return self.stageCompletions.some(
        (entry) => entry.stage === stage && entry.status === EStepCodeStageStatus.complete
      )
    },
  }))
  .actions((self) => ({
    setProjectDetails(projectDetails: { title: string; fullAddress: string; referenceNumber?: string }) {
      self.title = projectDetails.title
      self.fullAddress = projectDetails.fullAddress
      if (projectDetails.referenceNumber !== undefined) self.referenceNumber = projectDetails.referenceNumber
    },
    update: flow(function* (
      data: Partial<{
        fullAddress: string
        pid: string
        referenceNumber: string
        title: string
        permitDate: string
        phase: string
        currentStage: EStepCodeChecklistStage
        jurisdictionId: string
      }>
    ) {
      // @ts-ignore environment provided by composed models (Part3/Part9)
      const response = yield* toGenerator(self.environment.api.updateStepCode(self.id as any, data))
      if (response.ok) {
        if (data.currentStage) self.currentStage = data.currentStage
        try {
          // @ts-ignore rootStore provided by withRootStore on composed models
          self.rootStore.stepCodeStore.mergeUpdate(response.data.data, "stepCodesMap")
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to merge updated Step Code:", error)
          }
        }
      }
      return response.ok
    }),
    setCurrentStage(stage: EStepCodeChecklistStage) {
      self.currentStage = stage
    },
    shareReportWithJurisdiction: flow(function* (reportDocumentId: string) {
      if (!reportDocumentId) {
        return { ok: false, error: "No report document available" }
      }

      // @ts-ignore environment provided by composed models (Part3/Part9)
      const response = yield* toGenerator(
        // @ts-ignore environment provided by composed models (Part3/Part9)
        self.environment.api.shareReportDocumentWithJurisdiction(reportDocumentId)
      )

      return { ok: response.ok, data: response.data }
    }),
    archive: flow(function* () {
      // @ts-ignore environment provided by composed models (Part3/Part9)
      const response = yield* toGenerator(self.environment.api.archiveStepCode(self.id as any))
      if (response.ok) {
        // @ts-ignore rootStore provided by withRootStore on composed models
        self.rootStore.stepCodeStore.mergeUpdate(response.data.data, "stepCodesMap")
      }
      return response.ok
    }),
    restore: flow(function* () {
      // @ts-ignore environment provided by composed models (Part3/Part9)
      const response = yield* toGenerator(self.environment.api.restoreStepCode(self.id as any))
      if (response.ok) {
        // @ts-ignore rootStore provided by withRootStore on composed models
        self.rootStore.stepCodeStore.mergeUpdate(response.data.data, "stepCodesMap")
      }
      return response.ok
    }),
  }))
