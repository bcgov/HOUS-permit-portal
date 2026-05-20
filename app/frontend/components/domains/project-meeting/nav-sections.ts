export interface IProjectMeetingNavSection {
  key: string
  location: string
  nonOwnerOnly?: boolean
}

export const projectMeetingNavSections: IProjectMeetingNavSection[] = [
  { key: "projectInformation", location: "project-information" },
  { key: "relationship", location: "relationship" },
  { key: "authorizationDocuments", location: "authorization-documents", nonOwnerOnly: true },
  { key: "contactDetails", location: "contact-details" },
  { key: "discussion", location: "discussion" },
  { key: "documents", location: "documents" },
  { key: "propertyInformation", location: "property-information" },
  { key: "review", location: "review" },
]
