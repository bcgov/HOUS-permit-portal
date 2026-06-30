import {
  IPart9NavLink,
  IPart9NavSection,
  IPart9SectionCompletionStatus,
  TPart9NavLinkKey,
} from "../../../../../types/types"

export const navLinks: IPart9NavLink[] = [
  {
    key: "start",
    location: "start",
    subLinks: [],
    section: "overview",
  },
  {
    key: "buildingInfo",
    location: "building-info",
    subLinks: [],
    section: "overview",
  },
  {
    key: "h2kImport",
    location: "h2k-import",
    subLinks: [],
    section: "overview",
  },
  {
    key: "complianceSummary",
    location: "compliance-summary",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "completedBy",
    location: "completed-by",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "buildingCharacteristics",
    location: "building-characteristics",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "energyPerformance",
    location: "energy-performance",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "energyStepCompliance",
    location: "energy-step-compliance",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "zeroCarbonCompliance",
    location: "zero-carbon-compliance",
    subLinks: [],
    section: "compliance",
  },
  {
    key: "review",
    location: "review",
    subLinks: [],
    section: "results",
  },
  {
    key: "report",
    location: "report",
    subLinks: [],
    section: "results",
  },
]

export const navSections: IPart9NavSection[] = [
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

export const reportDependentSectionKeys: TPart9NavLinkKey[] = [
  "complianceSummary",
  "completedBy",
  "buildingCharacteristics",
  "energyPerformance",
  "energyStepCompliance",
  "zeroCarbonCompliance",
  "review",
  "report",
]

export const defaultSectionCompletionStatus: IPart9SectionCompletionStatus = {
  start: { complete: false, relevant: true },
  projectInfo: { complete: false, relevant: false },
  buildingInfo: { complete: false, relevant: true },
  h2kImport: { complete: false, relevant: true },
  complianceSummary: { complete: false, relevant: true },
  completedBy: { complete: false, relevant: true },
  buildingCharacteristics: { complete: false, relevant: true },
  energyPerformance: { complete: false, relevant: true },
  energyStepCompliance: { complete: false, relevant: true },
  zeroCarbonCompliance: { complete: false, relevant: true },
  review: { complete: false, relevant: true },
  report: { complete: false, relevant: true },
}
