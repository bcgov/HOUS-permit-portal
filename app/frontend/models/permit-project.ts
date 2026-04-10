import { t } from "i18next"
import { flow, Instance, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import { EPermitProjectRollupStatus, EProjectState } from "../types/enums"
import { IParcelGeometry, IProjectAuditSummary, IProjectDocument } from "../types/types"
import { ICollaborator } from "./collaborator"
import { JurisdictionModel } from "./jurisdiction"
import { IPermitApplication, PermitApplicationModel } from "./permit-application"

export interface IAggregatedReviewCollaborator {
  id: string
  name: string
  role: string
  isProjectCollaborator: boolean
}

export interface IPermitProjectCollaboration {
  id: string
  collaborator: ICollaborator
}

export const PermitProjectModel = types
  .model("PermitProjectModel", {
    id: types.identifier,
    title: types.string,
    fullAddress: types.maybeNull(types.string),
    pid: types.maybeNull(types.string),
    number: types.maybeNull(types.string),
    jurisdictionDisambiguatedName: types.string,
    sortedApplicationStatuses: types.optional(
      types.array(types.frozen<{ id: string; status: string; nickname: string | null }>()),
      []
    ),
    inboxSortedApplicationStatuses: types.optional(
      types.array(types.frozen<{ id: string; status: string; nickname: string | null }>()),
      []
    ),
    state: types.enumeration(Object.values(EProjectState)),
    tablePermitApplications: types.maybeNull(types.array(types.reference(types.late(() => PermitApplicationModel)))),
    recentPermitApplications: types.maybeNull(types.array(types.reference(types.late(() => PermitApplicationModel)))),
    projectDocuments: types.maybeNull(types.array(types.frozen<IProjectDocument>())), // Changed to IProjectDocument
    isPinned: types.optional(types.boolean, false),
    createdAt: types.Date,
    updatedAt: types.Date,
    totalPermitsCount: types.optional(types.number, 0),
    newDraftCount: types.optional(types.number, 0),
    newlySubmittedCount: types.optional(types.number, 0),
    inReviewCount: types.optional(types.number, 0),
    resubmittedCount: types.optional(types.number, 0),
    revisionsRequestedCount: types.optional(types.number, 0),
    approvedCount: types.optional(types.number, 0),
    jurisdiction: types.maybeNull(types.reference(types.late(() => JurisdictionModel))),
    flagList: types.optional(types.array(types.string), []),
    allowedManualTransitions: types.optional(types.array(types.string), []),
    hasOutdatedDraftApplications: types.maybeNull(types.boolean),
    isFullyLoaded: types.optional(types.boolean, false),
    ownerName: types.maybeNull(types.string),
    ownerId: types.maybeNull(types.string),
    latitude: types.maybeNull(types.string), // From decimal in backend
    longitude: types.maybeNull(types.string), // From decimal in backend
    viewedAt: types.maybeNull(types.Date),
    enqueuedAt: types.maybeNull(types.Date),
    parcelGeometry: types.maybeNull(types.frozen<IParcelGeometry>()),
    inboxSortOrder: types.maybeNull(types.number),
    recentAudits: types.optional(types.array(types.frozen<IProjectAuditSummary>()), []),
    permitProjectCollaborations: types.optional(types.array(types.frozen<IPermitProjectCollaboration>()), []),
    aggregatedReviewCollaborators: types.optional(types.array(types.frozen<IAggregatedReviewCollaborator>()), []),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get rollupStatus(): EPermitProjectRollupStatus {
      const first = self.sortedApplicationStatuses[0]
      return (first?.status as EPermitProjectRollupStatus) ?? EPermitProjectRollupStatus.empty
    },
    get inboxRollupStatus(): EPermitProjectRollupStatus {
      const first = self.inboxSortedApplicationStatuses[0]
      return (first?.status as EPermitProjectRollupStatus) ?? EPermitProjectRollupStatus.empty
    },
    get inIntakeCount(): number {
      return self.newlySubmittedCount + self.resubmittedCount
    },
    get inDraftCount(): number {
      return self.newDraftCount + self.revisionsRequestedCount
    },
  }))
  .views((self) => ({
    get inQueueCount(): number {
      return self.totalPermitsCount - self.inDraftCount
    },
    get shortAddress() {
      return self.fullAddress?.split(",")[0]
    },
    get daysInQueue(): number | null {
      if (!self.enqueuedAt) return null
      const ms = Date.now() - self.enqueuedAt.getTime()
      return Math.floor(ms / (1000 * 60 * 60 * 24))
    },
    get formattedDaysInQueue(): string {
      const days = this.daysInQueue
      if (days == null) return "—"
      return `${days} ${days === 1 ? "day" : "days"}`
    },
    get formattedEnqueuedAt(): string {
      if (!self.enqueuedAt) return "—"
      return new Intl.DateTimeFormat("en-CA").format(self.enqueuedAt)
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
    setInboxSortOrder(order: number) {
      self.inboxSortOrder = order
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
    markAsViewed: flow(function* () {
      const response = yield* toGenerator(self.environment.api.viewPermitProject(self.id))
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
      }
      return response.ok
    }),
    markAsUnviewed: flow(function* () {
      const response = yield* toGenerator(self.environment.api.unviewPermitProject(self.id))
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
      }
      return response.ok
    }),
    transitionState: flow(function* (targetState: string) {
      const oldState = self.state
      const response = yield* toGenerator(self.environment.api.transitionPermitProjectState(self.id, targetState))
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
        self.rootStore.submissionInboxStore?.permitProjectSearch?.adjustCountsForTransition(oldState, targetState)
      }
      return response
    }),
    assignProjectReviewCollaborator: flow(function* (collaboratorId: string) {
      const response = yield* toGenerator(self.environment.api.assignProjectReviewCollaborator(self.id, collaboratorId))
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
      }
      return response
    }),
    unassignProjectReviewCollaborator: flow(function* (collaboratorId: string) {
      const response = yield* toGenerator(
        self.environment.api.unassignProjectReviewCollaborator(self.id, collaboratorId)
      )
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
      }
      return response
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
