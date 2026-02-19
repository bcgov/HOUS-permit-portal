import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitProjectRollupStatus } from "../types/enums"
import { IParcelGeometry, IProjectDocument } from "../types/types"
import { JurisdictionModel } from "./jurisdiction"
import { IPermitApplication, PermitApplicationModel } from "./permit-application"

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    title: types.string,
    fullAddress: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    number: types.maybeNull(types.string),
    jurisdictionDisambiguatedName: types.string,
    rollupStatus: types.enumeration(Object.values(EPermitProjectRollupStatus)),
    tablePermitApplications: types.maybeNull(types.array(types.reference(types.late(() => PermitApplicationModel)))),
    recentPermitApplications: types.maybeNull(types.array(types.reference(types.late(() => PermitApplicationModel)))),
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
    ownerName: types.maybeNull(types.string),
    ownerId: types.maybeNull(types.string),
    latitude: types.maybeNull(types.string), // From decimal in backend
    longitude: types.maybeNull(types.string), // From decimal in backend
    parcelGeometry: types.maybeNull(types.frozen<IParcelGeometry>()),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get shortAddress() {
      return self.fullAddress?.split(",")[0]
    },
    get rollupStatusDescription() {
      const total = self.totalPermitsCount

      const remainingCount = self.newDraftCount + self.revisionsRequestedCount
      const submittedCount = self.newlySubmittedCount + self.resubmittedCount

      if (self.rollupStatus === EPermitProjectRollupStatus.empty) {
        return t("permitProject.rollupStatusDescription.empty")
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
    get isOwner() {
      return self.ownerId === self.rootStore.userStore.currentUser?.id
    },
    get jurisdictionDifferentFromSandbox() {
      if (!self.rootStore.sandboxStore.currentSandbox) return false
      return self.jurisdiction?.id !== self.rootStore.sandboxStore.currentSandbox?.jurisdictionId
    },
    get mapPosition(): [number, number] | null {
      if (self.latitude && self.longitude) {
        return [Number(self.longitude), Number(self.latitude)]
      }
      return null
    },
    get parcelRings(): [number, number][][] | null {
      return self.parcelGeometry?.rings ?? null
    },
  }))
  .actions((self) => ({
    setIsPinned(isPinned: boolean) {
      self.isPinned = isPinned
    },
    resetIsFullyLoaded() {
      self.isFullyLoaded = false
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
    fetchSubmissionCollaboratorOptions: flow(function* () {
      const response = yield* toGenerator(self.environment.api.fetchSubmissionCollaboratorOptions(self.id))
      if (response.ok) {
        return response.data.data
      }
      return []
    }),
  }))
  .actions((self) => ({
    bulkCreatePermitApplications: flow(function* (
      params: Array<{ activityId: string; permitTypeId: string; firstNations: boolean }>
    ) {
      const response = yield* toGenerator(self.environment.api.createProjectPermitApplications(self.id, params))
      if (response.ok) {
        // Merge created applications into store
        self.rootStore.permitApplicationStore.mergeUpdateAll(response.data.data, "permitApplicationMap")
        // Update table list when viewing project context
        self.setTablePermitApplications(response.data.data as any)
      }
      return response
    }),
  }))

export interface IPermitProject extends Instance<typeof PermitProjectModel> {}
