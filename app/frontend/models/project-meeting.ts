import { Instance, types } from "mobx-state-tree"
import { withEnvironment } from "../lib/with-environment"
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
    meetingUrl: types.maybeNull(types.string),
    createdAt: types.maybeNull(types.Date),
    updatedAt: types.maybeNull(types.Date),
    meetingRequestDocuments: types.optional(types.array(types.frozen<IMeetingRequestDocument>()), []),
  })
  .extend(withEnvironment())
  .views((self) => ({
    get isSubmitted() {
      return self.status === EProjectMeetingStatus.submitted
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

export interface IProjectMeeting extends Instance<typeof ProjectMeetingModel> {}
