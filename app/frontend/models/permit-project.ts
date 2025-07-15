import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitApplicationStatus, EPermitProjectPhase } from "../types/enums"
import { IProjectDocument } from "../types/types" // Updated import
import { PermitApplicationModel } from "./permit-application"

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    title: types.string,
    fullAddress: types.maybeNull(types.string),
    jurisdictionDisambiguatedName: types.string,
    forcastedCompletionDate: types.maybeNull(types.Date),
    phase: types.enumeration(Object.values(EPermitProjectPhase)),
    permitApplications: types.array(types.reference(types.late(() => PermitApplicationModel))),
    projectDocuments: types.maybeNull(types.array(types.frozen<IProjectDocument>())), // Changed to IProjectDocument
    isPinned: types.optional(types.boolean, false),
    createdAt: types.Date,
    updatedAt: types.Date,
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get shortAddress() {
      return self.fullAddress?.split(",")[0]
    },
    get phaseDescription() {
      const total = self.permitApplications.length
      if (total === 0) return ""
      const newDraftCount = self.permitApplications.filter(
        (pa) => pa.status === EPermitApplicationStatus.newDraft
      ).length
      const revisionsCount = self.permitApplications.filter(
        (pa) => pa.status === EPermitApplicationStatus.revisionsRequested
      ).length
      const newlySubmittedCount = self.permitApplications.filter(
        (pa) => pa.status === EPermitApplicationStatus.newlySubmitted
      ).length
      const resubmittedCount = self.permitApplications.filter(
        (pa) => pa.status === EPermitApplicationStatus.resubmitted
      ).length
      const submittedCount = newlySubmittedCount + resubmittedCount

      if (self.phase === EPermitProjectPhase.empty) {
        return ""
      } else if (self.phase === EPermitProjectPhase.newDraft) {
        return `${newDraftCount + revisionsCount} of ${total} permits remaining`
      } else if (self.phase === EPermitProjectPhase.newlySubmitted || self.phase === EPermitProjectPhase.resubmitted) {
        return `${submittedCount} permit${submittedCount === 1 ? "" : "s"} waiting for response`
      } else if (self.phase === EPermitProjectPhase.revisionsRequested) {
        return `${revisionsCount} permit${revisionsCount === 1 ? "" : "s"} returned for revision`
      } else if (self.phase === EPermitProjectPhase.approved) {
        return `All ${total} permit${total === 1 ? "" : "s"} approved`
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
  }))

export interface IPermitProject extends Instance<typeof PermitProjectModel> {}
