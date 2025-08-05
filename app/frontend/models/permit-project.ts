import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitProjectRollupStatus } from "../types/enums"
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
    rollupStatus: types.enumeration(Object.values(EPermitProjectRollupStatus)),
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
    hasOutdatedDraftApplications: types.maybeNull(types.boolean),
    isFullyLoaded: types.optional(types.boolean, false),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get shortAddress() {
      return self.fullAddress?.split(",")[0]
    },
    get rollupStatusDescription() {
      const total = self.totalPermitsCount
      if (total === 0) return ""
      const remainingCount = self.newDraftCount + self.revisionsRequestedCount
      const submittedCount = self.newlySubmittedCount + self.resubmittedCount

      if (self.rollupStatus === EPermitProjectRollupStatus.empty) {
        return ""
      } else if (self.rollupStatus === EPermitProjectRollupStatus.newDraft) {
        return t("permitProject.rollupStatusDescription.inProgress", { remaining: remainingCount, total })
      } else if (
        self.rollupStatus === EPermitProjectRollupStatus.newlySubmitted ||
        self.rollupStatus === EPermitProjectRollupStatus.resubmitted
      ) {
        return t("permitProject.rollupStatusDescription.submitted", { count: submittedCount })
      } else if (self.rollupStatus === EPermitProjectRollupStatus.revisionsRequested) {
        return t("permitProject.rollupStatusDescription.waitingOnYou", { count: self.revisionsRequestedCount })
      } else if (self.rollupStatus === EPermitProjectRollupStatus.approved) {
        return t("permitProject.rollupStatusDescription.approved", { count: total })
      } else {
        return ""
      }
    },
  }))
  .actions((self) => ({
    setIsPinned(isPinned: boolean) {
      self.isPinned = isPinned
    },
  }))
  .actions((self) => ({
    togglePin: flow(function* () {
      const originalIsPinned = self.isPinned

      const store = self.rootStore.permitProjectStore

      const response = originalIsPinned
        ? yield* toGenerator(self.environment.api.unpinPermitProject(self.id))
        : yield* toGenerator(self.environment.api.pinPermitProject(self.id))

      if (response.ok) {
        self.setIsPinned(!originalIsPinned)
        store.mergeUpdateAll(response.data.data, "permitProjectMap")
        store.setPinnedProjects(response.data.data)
      }
    }),
    setTablePermitApplications(permitApplications: IPermitApplication[]) {
      self.tablePermitApplications = permitApplications.map((p) => p.id) as any
    },
  }))

export interface IPermitProject extends Instance<typeof PermitProjectModel> {}
