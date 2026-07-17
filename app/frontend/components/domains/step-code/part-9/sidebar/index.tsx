import { Box, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { usePart9StepCode } from "../../../../../hooks/resources/use-part-9-step-code"
import { ProjectInfoSidebarLink } from "../../sidebar/project-info-sidebar-link"
import { usePart9Navigation } from "../use-part-9-navigation"
import { navSections, reportDependentSectionKeys } from "./nav-sections"
import { SectionHeader } from "./section-header"
import { SectionLink } from "./section-link"
import { SubLink } from "./sub-link"

export const Sidebar = observer(function Part9StepCodeSidebar() {
  const { checklist } = usePart9StepCode()
  const { infoPagePath } = usePart9Navigation()
  const reportAvailable = Boolean(checklist?.selectedReport)

  return (
    <VStack w="full" align="stretch" pt={4}>
      <ProjectInfoSidebarLink to={infoPagePath} />
      {navSections.map((section) => (
        <React.Fragment key={section.key}>
          <SectionHeader title={t(`stepCode.part9.sidebar.${section.key}`)} />
          {section.navLinks.map((navLink) => {
            const isDisabled = reportDependentSectionKeys.includes(navLink.key) && !reportAvailable

            return (
              checklist?.isRelevant(navLink.key) && (
                <React.Fragment key={navLink.key}>
                  <SectionLink navLink={navLink} isDisabled={isDisabled} />
                  {navLink.subLinks.map(
                    (subLink) =>
                      checklist.isRelevant(subLink.key) && (
                        <SubLink
                          key={subLink.key}
                          subLink={subLink}
                          isDisabled={reportDependentSectionKeys.includes(subLink.key) && !reportAvailable}
                        />
                      )
                  )}
                </React.Fragment>
              )
            )
          })}
        </React.Fragment>
      ))}
      <Box py={2} w="full" />
    </VStack>
  )
})
