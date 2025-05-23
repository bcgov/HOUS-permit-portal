import { Box, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { navSections } from "./nav-sections"
import { SectionHeader } from "./section-header"
import { SectionLink } from "./section-link"
import { SubLink } from "./sub-link"

export const Sidebar = observer(function Part3StepCodeSidebar() {
  const { checklist } = usePart3StepCode()

  return (
    <VStack w="full" align="stretch" pt={4}>
      {navSections.map((section) => (
        <React.Fragment key={section.key}>
          <SectionHeader title={t(`stepCode.part3.sidebar.${section.key}`)} />
          {section.navLinks.map(
            (navLink) =>
              checklist?.isRelevant(navLink.key) && (
                <React.Fragment key={navLink.key}>
                  <SectionLink navLink={navLink} />
                  {navLink.subLinks.map(
                    (subLink) => checklist.isRelevant(subLink.key) && <SubLink key={subLink.key} subLink={subLink} />
                  )}
                </React.Fragment>
              )
          )}
        </React.Fragment>
      ))}
      {/* add some padding below the final element */}
      <Box py={2} w="full" />
    </VStack>
  )
})
