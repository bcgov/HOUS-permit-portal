import { IPart3NavLink, IPart3NavSection } from "../../../../../types/types"

export const navLinks: IPart3NavLink[] = [
  {
    key: "start",
    location: "start",
    subLinks: [],
    section: "overview",
  },
  {
    key: "projectDetails",
    location: "project-details",
    subLinks: [],
    section: "overview",
  },
  {
    key: "buildingDetails",
    location: "building-details",
    subLinks: [],
    section: "overview",
  },
  {
    key: "districtEnergy",
    location: "district-energy",
    subLinks: [],
    section: "overview",
  },
  {
    key: "baselineOccupancies",
    location: "baseline-occupancies",
    subLinks: [
      {
        key: "baselineDetails",
        location: "details",
        subLinks: [],
      },
    ],
    section: "compliance",
  },
  {
    key: "fuelTypes",
    location: "fuel-types",
    subLinks: [
      {
        key: "additionalFuelTypes",
        location: "additional-fuel-types",
        subLinks: [],
        section: "compliance",
      },
    ],
    section: "compliance",
  },
  {
    key: "baselinePerformance",
    location: "baseline-performance",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "stepCodeOccupancies",
    location: "step-code-occupancies",
    subLinks: [
      {
        key: "stepCodePerformanceRequirements",
        location: "step-code-performance-requirements",
        subLinks: [],
      },
    ],
    section: "compliance",
  },
  {
    key: "modelledOutputs",
    location: "modelled-outputs",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "renewableEnergy",
    location: "renewable-energy",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "overheatingRequirements",
    location: "overheating-requirements",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "projectAdjustments",
    location: "project-adjustments",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "documentReferences",
    location: "document-references",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "performanceCharacteristics",
    location: "performance-characteristics",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "hvac",
    location: "hvac",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "contact",
    location: "contact",
    subLinks: [],
    section: "results",
  },
  {
    key: "requirementsSummary",
    location: "requirements-summary",
    subLinks: [],
    section: "results",
  },
  {
    key: "stepCodeSummary",
    location: "step-code-summary",
    subLinks: [],
    section: "results",
  },
]

export const navSections: IPart3NavSection[] = [
  {
    key: "overview",
    navLinks: navLinks.filter((l) => l.section == "overview"),
  },
  {
    key: "compliance",
    navLinks: navLinks.filter((l) => l.section == "compliance"),
  },
  {
    key: "results",
    navLinks: navLinks.filter((l) => l.section == "results"),
  },
]

export const defaultSectionCompletionStatus = {
  start: false,
  projectDetails: false,
  energySetup: false,
  districtEnergy: false,
  baselineOccupancies: false,
  baselineDetails: false,
  fuelTypes: false,
}
