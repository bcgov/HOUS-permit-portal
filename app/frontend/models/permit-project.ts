import { format } from "date-fns"
import { t } from "i18next"
import { cast, flow, getSnapshot, Instance, toGenerator, types } from "mobx-state-tree"
import { datefnsTableDateFormat } from "../constants"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import {
  ECollaboratorAccess,
  EInboxDisplayMode,
  EMeetingAccess,
  EPermitProjectRollupStatus,
  EProjectAccess,
  EProjectMembershipRole,
  EProjectRole,
  EProjectState,
  EProjectTeamKind,
} from "../types/enums"
import { IParcelGeometry, IProjectAuditSummary, IProjectDocument } from "../types/types"
import { startBlobDownload } from "../utils/utility-functions"
import { CollaboratorModel } from "./collaborator"
import { JurisdictionModel } from "./jurisdiction"
import { INote, NoteModel } from "./note"
import { IPermitApplication, PermitApplicationModel } from "./permit-application"
import { PermitProjectCollaborationModel } from "./permit-project-collaboration"
import { PermitProjectInboxApplicationSearchSlice } from "./permit-project-inbox-application-search"
import { IProjectMeeting } from "./project-meeting"
import { ProjectMembershipModel } from "./project-membership"
import {
  atLeastLevel,
  COLLABORATOR_ACCESS_ORDER,
  EMPTY_PROJECT_PERMISSIONS,
  IProjectPermissions,
  MEETING_ACCESS_ORDER,
  PROJECT_ACCESS_ORDER,
} from "./project-permissions"
import { IProjectTeam, ProjectTeamModel, TProjectTeamParams } from "./project-team"

const PermitProjectCoreModel = types.model("PermitProjectCore", {
  id: types.identifier,
  title: types.optional(types.string, "-"),
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
  tablePermitApplications: types.optional(types.array(types.reference(types.late(() => PermitApplicationModel))), []),
  notes: types.optional(types.array(types.reference(types.late(() => NoteModel))), []),
  inboxTablePermitApplications: types.optional(
    types.array(types.reference(types.late(() => PermitApplicationModel))),
    []
  ),
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
  hasActiveProjectMeeting: types.optional(types.boolean, false),
  activeProjectMeetingId: types.maybeNull(types.string),
  isFullyLoaded: types.optional(types.boolean, false),
  ownerName: types.maybeNull(types.string),
  ownerId: types.maybeNull(types.string),
  latitude: types.maybeNull(types.string), // From decimal in backend
  longitude: types.maybeNull(types.string), // From decimal in backend
  viewedAt: types.maybeNull(types.Date),
  enqueuedAt: types.maybeNull(types.Date),
  firstApplicationReceivedAt: types.maybeNull(types.Date),
  parcelGeometry: types.maybeNull(types.frozen<IParcelGeometry>()),
  inboxSortOrder: types.maybeNull(types.number),
  daysInQueue: types.maybeNull(types.number),
  recentAudits: types.optional(types.array(types.frozen<IProjectAuditSummary>()), []),
  reviewDelegatee: types.maybeNull(types.safeReference(CollaboratorModel)),
  permitProjectCollaborations: types.optional(types.array(PermitProjectCollaborationModel), []),
  activeProjectMeeting: types.maybeNull(types.frozen<IProjectMeeting>()),
  displayMode: types.optional(types.enumeration(Object.values(EInboxDisplayMode)), EInboxDisplayMode.list),
  currentUserRole: types.maybeNull(types.enumeration(Object.values(EProjectRole))),
  currentUserPermissions: types.optional(types.frozen<IProjectPermissions>(), EMPTY_PROJECT_PERMISSIONS),
  projectMemberships: types.optional(types.array(ProjectMembershipModel), []),
  projectTeams: types.optional(types.array(ProjectTeamModel), []),
})

export const PermitProjectModel = types
  .compose(PermitProjectCoreModel, PermitProjectInboxApplicationSearchSlice)
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
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
    get formattedDaysInQueue(): string {
      if (self.daysInQueue == null) return "—"
      return t("submissionInbox.daysInQueue", { count: self.daysInQueue })
    },
    get formattedFirstApplicationReceivedAt(): string {
      if (!self.firstApplicationReceivedAt) return t("permitProject.overview.notAvailable")
      return format(self.firstApplicationReceivedAt, datefnsTableDateFormat)
    },
    // COLLAB TODO(phase 4): Full read is the only application-visibility grant today, so this
    // is a project-wide on/off. Ceiling: per-application viewing. Then this
    // cannot stay "has Full read" — callers that skip search/grid entirely would
    // hide apps the user is allowed to see. Upgrade: delete this getter (or make
    // it "has any visible application") and let PermitApplicationPolicy::Scope
    // return the subset.
    get canViewApplications() {
      return atLeastLevel(PROJECT_ACCESS_ORDER, self.currentUserPermissions?.projectAccess, EProjectAccess.read)
    },
    get applicationsSummary() {
      if (!atLeastLevel(PROJECT_ACCESS_ORDER, self.currentUserPermissions?.projectAccess, EProjectAccess.read)) {
        return ""
      }
      const total = self.totalPermitsCount
      if (total === 0) {
        return t("permitProject.applicationsSummary.empty")
      }
      return t("permitProject.applicationsSummary.readyToWork", {
        ready: self.inDraftCount,
        total,
      })
    },
    get isOwner() {
      return self.ownerId === self.rootStore.userStore.currentUser?.id
    },
    get canEditProject() {
      return atLeastLevel(PROJECT_ACCESS_ORDER, self.currentUserPermissions?.projectAccess, EProjectAccess.edit)
    },
    // One domain gates the People & access screen.
    get canViewCollaborators() {
      return atLeastLevel(
        COLLABORATOR_ACCESS_ORDER,
        self.currentUserPermissions?.collaboratorAccess,
        ECollaboratorAccess.view
      )
    },
    get canManageCollaborators() {
      return atLeastLevel(
        COLLABORATOR_ACCESS_ORDER,
        self.currentUserPermissions?.collaboratorAccess,
        ECollaboratorAccess.manage
      )
    },
    get canViewMeetings() {
      return atLeastLevel(MEETING_ACCESS_ORDER, self.currentUserPermissions?.meetingAccess, EMeetingAccess.view)
    },
    get canManageMeetings() {
      return atLeastLevel(MEETING_ACCESS_ORDER, self.currentUserPermissions?.meetingAccess, EMeetingAccess.manage)
    },
    get autoTeams() {
      const order = [EProjectTeamKind.leads, EProjectTeamKind.contributors, EProjectTeamKind.allMembers]
      return order.map((kind) => self.projectTeams.find((team) => team.kind === kind)).filter(Boolean)
    },
    get customTeams() {
      return self.projectTeams.filter((team) => team.kind === EProjectTeamKind.custom)
    },
    // The team payload carries its membership ids for every kind, auto teams
    // included, so display does not need to know how membership was derived.
    membershipsForTeam(team: IProjectTeam) {
      return team.projectMembershipIds
        .map((membershipId) => self.projectMemberships.find((membership) => membership.id === membershipId))
        .filter(Boolean)
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
    setInboxDisplayMode(mode: EInboxDisplayMode) {
      self.displayMode = mode
    },
    setNotes(notes: INote[]) {
      self.notes = cast(notes.map((note) => note.id))
    },
    prependNote(note: INote) {
      self.notes = cast([note.id, ...self.notes.map((existingNote) => existingNote.id).filter((id) => id !== note.id)])
    },
    setProjectMemberships(memberships: any[]) {
      self.projectMemberships = cast(memberships)
    },
    setProjectTeams(teams: any[]) {
      self.projectTeams = cast(teams)
    },
    downloadNotesCsv: flow(function* () {
      const response = yield* toGenerator(self.environment.api.downloadPermitProjectNotesCsv(self.id))
      if (response.ok) {
        startBlobDownload(response.data, "text/csv", `project-notes-${self.number || self.id}.csv`)
      }
      return response.ok
    }),
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
      const wasUnread = !self.viewedAt
      const state = self.state
      const response = yield* toGenerator(self.environment.api.viewPermitProject(self.id))
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
        if (wasUnread) {
          self.rootStore.submissionInboxStore?.permitProjectSearch?.adjustUnreadCountForColumn(state, -1)
        }
      }
      return response.ok
    }),
    markAsUnviewed: flow(function* () {
      const wasViewed = !!self.viewedAt
      const state = self.state
      const response = yield* toGenerator(self.environment.api.unviewPermitProject(self.id))
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
        if (wasViewed) {
          self.rootStore.submissionInboxStore?.permitProjectSearch?.adjustUnreadCountForColumn(state, 1)
        }
      }
      return response.ok
    }),
    transitionState: flow(function* (targetState: string) {
      const oldState = self.state
      const isUnread = !self.viewedAt
      const response = yield* toGenerator(self.environment.api.transitionPermitProjectState(self.id, targetState))
      if (response.ok) {
        self.rootStore.permitProjectStore.mergeUpdate(response.data.data, "permitProjectMap")
        self.rootStore.submissionInboxStore?.permitProjectSearch?.adjustCountsForTransition(
          oldState,
          targetState,
          isUnread
        )
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
    fetchProjectMemberships: flow(function* () {
      const response = yield* toGenerator(self.environment.api.fetchProjectMemberships(self.id))
      if (response.ok) self.setProjectMemberships(response.data.data)
      return response.ok
    }),
    fetchProjectTeams: flow(function* () {
      const response = yield* toGenerator(self.environment.api.fetchProjectTeams(self.id))
      if (response.ok) self.setProjectTeams(response.data.data)
      return response.ok
    }),
    inviteProjectMemberships: flow(function* (
      users: {
        membership: EProjectMembershipRole
        email: string
        projectTeamIds?: string[]
      }[]
    ) {
      let anyOk = false
      for (const user of users) {
        const response = yield* toGenerator(
          self.environment.api.createProjectMembership(self.id, {
            role: user.membership,
            projectTeamIds: user.projectTeamIds,
            user: { email: user.email },
          })
        )
        if (response.ok) anyOk = true
      }
      if (anyOk) {
        const listResponse = yield* toGenerator(self.environment.api.fetchProjectMemberships(self.id))
        if (listResponse.ok) self.setProjectMemberships(listResponse.data.data)
        // Pre-assignment puts the new membership on a custom team, so People &
        // access member lists are stale too.
        if (users.some((user) => user.projectTeamIds?.length)) {
          const teamsResponse = yield* toGenerator(self.environment.api.fetchProjectTeams(self.id))
          if (teamsResponse.ok) self.setProjectTeams(teamsResponse.data.data)
        }
      }
      return anyOk
    }),
    updateProjectMembershipRole: flow(function* (membershipId: string, role: EProjectMembershipRole) {
      const response = yield* toGenerator(self.environment.api.updateProjectMembership(self.id, membershipId, { role }))
      if (response.ok) {
        self.setProjectMemberships(
          self.projectMemberships.map((membership) =>
            membership.id === membershipId ? response.data.data : getSnapshot(membership)
          )
        )
        // A role change moves the person between the Leads and Contributors
        // groups, so People & access member lists move with it.
        const teamsResponse = yield* toGenerator(self.environment.api.fetchProjectTeams(self.id))
        if (teamsResponse.ok) self.setProjectTeams(teamsResponse.data.data)
      }
      return response
    }),
    removeProjectMembership: flow(function* (membershipId: string) {
      const response = yield* toGenerator(self.environment.api.destroyProjectMembership(self.id, membershipId))
      if (response.ok) {
        self.setProjectMemberships(
          self.projectMemberships.filter((membership) => membership.id !== membershipId).map((m) => getSnapshot(m))
        )
        const teamsResponse = yield* toGenerator(self.environment.api.fetchProjectTeams(self.id))
        if (teamsResponse.ok) self.setProjectTeams(teamsResponse.data.data)
      }
      return response
    }),
    reinviteProjectMembership: flow(function* (membershipId: string) {
      return yield* toGenerator(self.environment.api.reinviteProjectMembership(self.id, membershipId))
    }),
    createProjectTeam: flow(function* (params: TProjectTeamParams) {
      const response = yield* toGenerator(self.environment.api.createProjectTeam(self.id, params))
      if (response.ok) {
        self.setProjectTeams([...self.projectTeams.map((team) => getSnapshot(team)), response.data.data])
      }
      return response
    }),
    updateProjectTeam: flow(function* (teamId: string, params: TProjectTeamParams) {
      const response = yield* toGenerator(self.environment.api.updateProjectTeam(self.id, teamId, params))
      if (response.ok) {
        self.setProjectTeams(
          self.projectTeams.map((team) => (team.id === teamId ? response.data.data : getSnapshot(team)))
        )
        // Membership changes move people between teams, so the collaborator
        // rows and their team badges are stale too.
        const listResponse = yield* toGenerator(self.environment.api.fetchProjectMemberships(self.id))
        if (listResponse.ok) self.setProjectMemberships(listResponse.data.data)
      }
      return response
    }),
    destroyProjectTeam: flow(function* (teamId: string) {
      const response = yield* toGenerator(self.environment.api.destroyProjectTeam(self.id, teamId))
      if (response.ok) {
        self.setProjectTeams(self.projectTeams.filter((team) => team.id !== teamId).map((team) => getSnapshot(team)))
        const listResponse = yield* toGenerator(self.environment.api.fetchProjectMemberships(self.id))
        if (listResponse.ok) self.setProjectMemberships(listResponse.data.data)
      }
      return response
    }),
    bulkCreatePermitApplications: flow(function* (
      params: Array<{ templateVersionId: string; jurisdictionId?: string }>
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
