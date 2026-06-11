import { Instance, cast, flow, toGenerator, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
import { withRootStore } from "../lib/with-root-store"
import {
  EMeetingRequestDocumentType,
  EProjectMeetingContactMethod,
  EProjectMeetingRequesterRelationship,
  EProjectMeetingStatus,
} from "../types/enums"
import { IMeetingRequestDocument } from "../types/types"
import { startBlobDownload } from "../utils/utility-functions"
import { INote, NoteModel } from "./note"

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
    contactMethod: types.maybeNull(types.enumeration(Object.values(EProjectMeetingContactMethod))),
    submittedAt: types.maybeNull(types.Date),
    confirmedDate: types.maybeNull(types.Date),
    scheduledAt: types.maybeNull(types.Date),
    completedAt: types.maybeNull(types.Date),
    closedAt: types.maybeNull(types.Date),
    meetingUrl: types.maybeNull(types.string),
    viewedAt: types.maybeNull(types.Date),
    notesCount: types.optional(types.number, 0),
    notes: types.optional(types.array(types.reference(types.late(() => NoteModel))), []),
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
      return self.status === EProjectMeetingStatus.open || self.status === EProjectMeetingStatus.scheduled
    },
    get isTerminal() {
      return self.status === EProjectMeetingStatus.completed || self.status === EProjectMeetingStatus.closed
    },
    get activeMeetingRequestDocuments() {
      return self.meetingRequestDocuments.filter((document) => !document._destroy)
    },
    get hasScheduledDetails() {
      return !!self.scheduledAt || !!self.confirmedDate || !!self.meetingUrl
    },
    get canSchedule() {
      return (
        self.status === EProjectMeetingStatus.open &&
        self.allowedManualTransitions.includes(EProjectMeetingStatus.scheduled)
      )
    },
    get canComplete() {
      return (
        self.status === EProjectMeetingStatus.scheduled &&
        self.allowedManualTransitions.includes(EProjectMeetingStatus.completed)
      )
    },
    get canCancel() {
      return self.allowedManualTransitions.includes(EProjectMeetingStatus.closed)
    },
    get canAddReviewerNote() {
      return [
        EProjectMeetingStatus.open,
        EProjectMeetingStatus.scheduled,
        EProjectMeetingStatus.completed,
        EProjectMeetingStatus.closed,
      ].includes(self.status)
    },
    get shouldShowScheduledBanner() {
      if (self.status === EProjectMeetingStatus.closed) return false
      if ([EProjectMeetingStatus.scheduled, EProjectMeetingStatus.completed].includes(self.status)) return true
      return !!self.scheduledAt || !!self.confirmedDate || !!self.meetingUrl
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
      const propertyInformationRequestsEnabled =
        self.rootStore.permitProjectStore.currentPermitProject?.jurisdiction?.propertyInformationRequestsEnabled ??
        false
      const propertyInformationSatisfied =
        !propertyInformationRequestsEnabled || self.requestPropertyInformation !== null

      return (
        !!self.requesterRelationship &&
        !!self.contactName &&
        !!self.contactEmail &&
        !!self.projectDescription &&
        propertyInformationSatisfied &&
        (!requiresAuthorization || hasAuthorizationDocument)
      )
    },
  }))
  .actions((self) => ({
    setNotesCount(count: number) {
      self.notesCount = count
    },
    setNotes(notes: INote[]) {
      self.notes = cast(notes.map((note) => note.id))
    },
    prependNote(note: INote) {
      self.notes = cast([note.id, ...self.notes.map((existingNote) => existingNote.id).filter((id) => id !== note.id)])
    },
    downloadNotesCsv: flow(function* (projectNumber: string | null) {
      const response = yield* toGenerator(self.environment.api.downloadProjectMeetingNotesCsv(self.id))
      if (response.ok) {
        startBlobDownload(response.data, "text/csv", `project-meeting-notes-${projectNumber || self.id}.csv`)
      }
      return response.ok
    }),
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
