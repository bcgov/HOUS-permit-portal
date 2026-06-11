export interface IProjectMeetingNavSection {
  key: string
  location: string
  nonOwnerOnly?: boolean
  propertyInformationRequestsOnly?: boolean
}

export const projectMeetingNavSections: IProjectMeetingNavSection[] = [
  { key: "projectInformation", location: "project-information" },
  { key: "relationship", location: "relationship" },
  { key: "authorizationDocuments", location: "authorization-documents", nonOwnerOnly: true },
  { key: "contactDetails", location: "contact-details" },
  { key: "discussion", location: "discussion" },
  { key: "documents", location: "documents" },
  { key: "propertyInformation", location: "property-information", propertyInformationRequestsOnly: true },
  { key: "review", location: "review" },
]
