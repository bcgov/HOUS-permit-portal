import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitProjectPhase } from "../types/enums"
import { IProjectDocument } from "../types/types" // Updated import
import { JurisdictionModel } from "./jurisdiction"
import { IPermitApplication, PermitApplicationModel } from "./permit-application"

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    title: types.string,
    fullAddress: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    projectNumber: types.maybeNull(types.string),
    jurisdictionDisambiguatedName: types.string,
    forcastedCompletionDate: types.maybeNull(types.Date),
    phase: types.enumeration(Object.values(EPermitProjectPhase)),
    tablePermitApplications: types.maybeNull(types.array(types.reference(types.late(() => PermitApplicationModel)))),
    recentPermitApplications: types.frozen<IPermitApplication[]>(),
    projectDocuments: types.maybeNull(types.array(types.frozen<IProjectDocument>())), // Changed to IProjectDocument
    isPinned: types.optional(types.boolean, false),
    createdAt: types.Date,
    updatedAt: types.Date,
    totalPermitsCount: types.optional(types.number, 0),
    newDraftCount: types.optional(types.number, 0),
    newlySubmittedCount: types.optional(types.number, 0),
    resubmittedCount: types.optional(types.number, 0),
    revisionsRequestedCount: types.optional(types.number, 0),
    approvedCount: types.optional(types.number, 0),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    hasOutdatedDraftApplications: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get shortAddress() {
      return self.fullAddress?.split(",")[0]
    },
    get phaseDescription() {
      const total = self.totalPermitsCount
      if (total === 0) return ""
      const remainingCount = self.newDraftCount + self.revisionsRequestedCount
      const submittedCount = self.newlySubmittedCount + self.resubmittedCount

      if (self.phase === EPermitProjectPhase.empty) {
        return ""
      } else if (self.phase === EPermitProjectPhase.newDraft) {
        return t("permitProject.phaseDescription.inProgress", { remaining: remainingCount, total })
      } else if (self.phase === EPermitProjectPhase.newlySubmitted || self.phase === EPermitProjectPhase.resubmitted) {
        return t("permitProject.phaseDescription.submitted", { count: submittedCount })
      } else if (self.phase === EPermitProjectPhase.revisionsRequested) {
        return t("permitProject.phaseDescription.waitingOnYou", { count: self.revisionsRequestedCount })
      } else if (self.phase === EPermitProjectPhase.approved) {
        return t("permitProject.phaseDescription.approved", { count: total })
      } else {
        return ""
      }
    },
  }))
  .actions((self) => ({
    setIsPinned(isPinned: boolean) {
      self.isPinned = isPinned
    },
    togglePin: flow(function* () {
      const originalIsPinned = self.isPinned
      // Optimistic update
      self.isPinned = !originalIsPinned

      const store = self.rootStore.permitProjectStore
      store.togglePinnedProject(self as IPermitProject)

      const response = !originalIsPinned
        ? yield* toGenerator(self.environment.api.pinPermitProject(self.id))
        : yield* toGenerator(self.environment.api.unpinPermitProject(self.id))

      if (response.ok) {
        store.mergeUpdate(response.data.data, "permitProjectMap")
      } else {
        // Revert on failure
        self.isPinned = originalIsPinned
        store.togglePinnedProject(self as IPermitProject)
      }
    }),
    setTablePermitApplications(permitApplications: IPermitApplication[]) {
      self.tablePermitApplications = permitApplications.map((p) => p.id) as any
    },
  }))

export interface IPermitProject extends Instance<typeof PermitProjectModel> {}
