import { Box, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { navSections } from "./nav-sections"
import { SectionHeader } from "./section-header"
import { SectionLink } from "./section-link"
import { SubLink } from "./sub-link"

export const Sidebar = observer(function Part3StepCodeSidebar() {
  return (
    <VStack w="full" align="stretch">
      {navSections.map((section) => (
        <React.Fragment key={section.key}>
          <SectionHeader title={t(`stepCode.part3.sidebar.${section.key}`)} />
          {section.navLinks.map((navLink) => (
            <React.Fragment key={navLink.key}>
              <SectionLink navLink={navLink} />
              {navLink.subLinks.map((subLink) => (
                <SubLink key={subLink.key} subLink={subLink} />
              ))}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
      {/* add some padding below the final element */}
      <Box py={2} w="full" />
    </VStack>
  )
})
