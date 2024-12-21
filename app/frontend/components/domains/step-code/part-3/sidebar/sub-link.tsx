import React from "react"
import { SectionLink } from "./section-link"

export const SubLink = function StepCodeSidebarSublink({ subLink }) {
  return <SectionLink navLink={subLink} ml={12} borderLeftWidth={2} borderColor="border.light" />
}
