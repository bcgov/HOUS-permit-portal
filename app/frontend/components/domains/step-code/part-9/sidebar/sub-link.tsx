import React from "react"
import { IPart9NavLink } from "../../../../../types/types"
import { SectionLink } from "./section-link"

interface IProps {
  subLink: IPart9NavLink
  isDisabled?: boolean
}

export const SubLink = function Part9StepCodeSidebarSublink({ subLink, isDisabled }: IProps) {
  return (
    <SectionLink navLink={subLink} isDisabled={isDisabled} ml={12} borderLeftWidth={2} borderColor="border.light" />
  )
}
