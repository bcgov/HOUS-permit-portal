import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitApplicationStatus } from "../types/enums"
import { IProjectDocument } from "../types/types" // Updated import
import { PermitApplicationModel } from "./permit-application"

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    title: types.string,
    fullAddress: types.maybeNull(types.string),
    jurisdictionDisambiguatedName: types.string,
    forcastedCompletionDate: types.maybeNull(types.Date),
    phase: types.enumeration(Object.values(EPermitApplicationStatus)),
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
      if (self.phase === EPermitApplicationStatus.Draft) {
        return ``
      } else if (self.phase === EPermitApplicationStatus.Submitted) {
        return
      } else if (self.phase === EPermitApplicationStatus.Approved) {
        return
      } else if (self.phase === EPermitApplicationStatus.Rejected) {
      } else {
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
