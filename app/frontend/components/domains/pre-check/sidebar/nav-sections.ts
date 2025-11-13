export interface INavLink {
  key: string
  location: string
  subLinks: ISubLink[]
}

export interface ISubLink {
  key: string
  location: string
}

export interface INavSection {
  key: string
  navLinks: INavLink[]
}

export const navSections: INavSection[] = [
  {
    key: "start",
    navLinks: [
      {
        key: "servicePartner",
        location: "service-partner",
        subLinks: [],
      },
      {
        key: "projectAddress",
        location: "project-address",
        subLinks: [],
      },
      {
        key: "agreementsAndConsent",
        location: "agreements-and-consent",
        subLinks: [],
      },
      {
        key: "buildingType",
        location: "building-type",
        subLinks: [],
      },
    ],
  },
  {
    key: "drawings",
    navLinks: [
      {
        key: "uploadDrawings",
        location: "upload-drawings",
        subLinks: [],
      },
    ],
  },
  {
    key: "reviewAndSubmit",
    navLinks: [
      {
        key: "confirmSubmission",
        location: "confirm-submission",
        subLinks: [],
      },
    ],
  },
  {
    key: "results",
    navLinks: [
      {
        key: "resultsSummary",
        location: "results-summary",
        subLinks: [],
      },
    ],
  },
]
