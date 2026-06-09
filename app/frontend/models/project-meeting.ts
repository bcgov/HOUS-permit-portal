import { Instance, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import {
  EMeetingRequestDocumentType,
  EProjectMeetingRequesterRelationship,
  EProjectMeetingStatus,
} from "../types/enums"
import { IMeetingRequestDocument } from "../types/types"

export const ProjectMeetingModel = types
  .model("ProjectMeeting", {
    id: types.identifier,
    permitProjectId: types.string,
    requestedById: types.string,
    status: types.enumeration(Object.values(EProjectMeetingStatus)),
    requesterRelationship: types.maybeNull(types.enumeration(Object.values(EProjectMeetingRequesterRelationship))),
    contactName: types.maybeNull(types.string),
    contactEmail: types.maybeNull(types.string),
    contactPhoneNumber: types.maybeNull(types.string),
    projectDescription: types.maybeNull(types.string),
    meetingNotes: types.maybeNull(types.string),
    requestPropertyInformation: types.maybeNull(types.boolean),
    submittedAt: types.maybeNull(types.Date),
    confirmedDate: types.maybeNull(types.Date),
    scheduledAt: types.maybeNull(types.Date),
    completedAt: types.maybeNull(types.Date),
    closedAt: types.maybeNull(types.Date),
    meetingUrl: types.maybeNull(types.string),
    viewedAt: types.maybeNull(types.Date),
    projectNumber: types.maybeNull(types.string),
    projectAddress: types.maybeNull(types.string),
    projectPid: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    allowedManualTransitions: types.optional(types.array(types.enumeration(Object.values(EProjectMeetingStatus))), []),
    meetingRequestDocuments: types.optional(types.array(types.frozen<IMeetingRequestDocument>()), []),
  })
  .extend(withEnvironment())
  .extend(withRootStore())
  .views((self) => ({
    get isSubmitted() {
      return self.status !== EProjectMeetingStatus.draft
    },
    get isOpen() {
      return self.status === EProjectMeetingStatus.open
    },
    get isActive() {
      return self.status === EProjectMeetingStatus.draft || self.status === EProjectMeetingStatus.open
    },
    get isTerminal() {
      return self.status === EProjectMeetingStatus.completed || self.status === EProjectMeetingStatus.closed
    },
    get authorizationRequired() {
      return (
        !!self.requesterRelationship &&
        self.requesterRelationship !== EProjectMeetingRequesterRelationship.ownerOrLandholder
      )
    },
    get isReadyForSubmission() {
      const requiresAuthorization =
        !!self.requesterRelationship &&
        self.requesterRelationship !== EProjectMeetingRequesterRelationship.ownerOrLandholder
      const hasAuthorizationDocument = self.meetingRequestDocuments.some(
        (document) => document.documentType === EMeetingRequestDocumentType.authorization
      )

      return (
        !!self.requesterRelationship &&
        !!self.contactName &&
        !!self.contactEmail &&
        !!self.projectDescription &&
        self.requestPropertyInformation !== null &&
        (!requiresAuthorization || hasAuthorizationDocument)
      )
    },
  }))
  .actions((self) => ({
    markAsViewed: flow(function* () {
      const wasUnread = !self.viewedAt
      const response = yield* toGenerator(self.environment.api.viewProjectMeeting(self.permitProjectId, self.id))
      if (response.ok) {
        self.rootStore.projectMeetingStore.mergeUpdate(response.data.data, "projectMeetingsMap")
        if (wasUnread) {
          self.rootStore.projectMeetingInboxStore.adjustUnreadCount(-1)
          const jurisdiction = self.rootStore.jurisdictionStore.currentJurisdiction
          if (jurisdiction?.unviewedProjectMeetingsCount != null) {
            jurisdiction.setUnviewedProjectMeetingsCount(Math.max(0, jurisdiction.unviewedProjectMeetingsCount - 1))
          }
        }
      }
      return response.ok
    }),
    markAsUnviewed: flow(function* () {
      const wasViewed = !!self.viewedAt
      const response = yield* toGenerator(self.environment.api.unviewProjectMeeting(self.permitProjectId, self.id))
      if (response.ok) {
        self.rootStore.projectMeetingStore.mergeUpdate(response.data.data, "projectMeetingsMap")
        if (wasViewed) {
          self.rootStore.projectMeetingInboxStore.adjustUnreadCount(1)
          const jurisdiction = self.rootStore.jurisdictionStore.currentJurisdiction
          if (jurisdiction?.unviewedProjectMeetingsCount != null) {
            jurisdiction.setUnviewedProjectMeetingsCount(jurisdiction.unviewedProjectMeetingsCount + 1)
          }
        }
      }
      return response.ok
    }),
  }))

export interface IProjectMeeting extends Instance<typeof ProjectMeetingModel> {}
