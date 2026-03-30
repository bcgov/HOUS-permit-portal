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
        key: "introduction",
        location: "introduction",
        subLinks: [],
      },
      {
        key: "buildingLocation",
        location: "building-location",
        subLinks: [],
      },
      {
        key: "coolingZoneCompliance",
        location: "cooling-zone-compliance",
        subLinks: [],
      },
      {
        key: "designConditions",
        location: "design-conditions",
        subLinks: [],
      },
      {
        key: "buildingComponents",
        location: "building-components-and-assemblies",
        subLinks: [],
      },
      {
        key: "attachedDocuments",
        location: "attached-documents",
        subLinks: [],
      },
      {
        key: "calculationsPerformedBy",
        location: "calculations-performed-by",
        subLinks: [],
      },
      {
        key: "summary",
        location: "summary",
        subLinks: [],
      },
    ],
  },
]
