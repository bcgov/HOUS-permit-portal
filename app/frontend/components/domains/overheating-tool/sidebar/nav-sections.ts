export interface INavLink {
  key: string
  label: string
  location: string
  subLinks?: INavLink[]
  section: string
}

export interface INavSection {
  key: string
  title: string
  navLinks: INavLink[]
}

export const navLinks: INavLink[] = [
  { key: "coverSheet", label: "Heating and cooling", location: "compliance", section: "overview" },
  { key: "inputSummary", label: "Input summary", location: "input-summary", section: "overview" },
  {
    key: "calculations",
    label: "Calculations",
    location: "calculations",
    section: "overview",
  },
  { key: "uploads", label: "Signed report", location: "uploads", section: "attachments" },
  { key: "review", label: "Confirm your submission", location: "review", section: "review" },
  { key: "result", label: "Result summary", location: "result", section: "result" },
]

export const navSections: INavSection[] = [
  { key: "overview", title: "Overview", navLinks: navLinks.filter((l) => l.section === "overview") },
  { key: "attachments", title: "Attachments", navLinks: navLinks.filter((l) => l.section === "attachments") },
  { key: "review", title: "Review and Submit", navLinks: navLinks.filter((l) => l.section === "review") },
  { key: "result", title: "Result", navLinks: navLinks.filter((l) => l.section === "result") },
]
