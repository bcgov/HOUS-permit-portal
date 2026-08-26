export interface IProjectMeetingNavSection {
  key: string
  location: string
  nonOwnerOnly?: boolean
  propertyInformationRequestsOnly?: boolean
  /** Included when editing requester info on an already-submitted meeting */
  requesterEditStep?: boolean
}

export const projectMeetingNavSections: IProjectMeetingNavSection[] = [
  { key: "projectInformation", location: "project-information" },
  { key: "relationship", location: "relationship", requesterEditStep: true },
  {
    key: "authorizationDocuments",
    location: "authorization-documents",
    nonOwnerOnly: true,
    requesterEditStep: true,
  },
  { key: "contactDetails", location: "contact-details", requesterEditStep: true },
  { key: "discussion", location: "discussion" },
  { key: "documents", location: "documents" },
  { key: "propertyInformation", location: "property-information", propertyInformationRequestsOnly: true },
  { key: "review", location: "review" },
]
