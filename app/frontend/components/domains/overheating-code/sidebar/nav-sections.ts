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
        key: "compliance",
        location: "compliance",
        subLinks: [],
      },
      {
        key: "heating",
        location: "heating",
        subLinks: [],
      },
      {
        key: "cooling",
        location: "cooling",
        subLinks: [],
      },
      {
        key: "calculationsBasedOn",
        location: "calculations-based-on",
        subLinks: [],
      },
      {
        key: "heatingDesignConditions",
        location: "heating-design-conditions",
        subLinks: [],
      },
      {
        key: "coolingDesignConditions",
        location: "cooling-design-conditions",
        subLinks: [],
      },
      {
        key: "buildingEnvelope",
        location: "building-envelope",
        subLinks: [],
      },
      {
        key: "roomByRoom",
        location: "room-by-room",
        subLinks: [],
      },
    ],
  },
]
