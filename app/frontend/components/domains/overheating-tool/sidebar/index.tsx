import { Box, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { navSections } from "./nav-sections"
import { SectionHeader } from "./section-header"
import { SectionLink } from "./section-link"
import { SubLink } from "./sub-link"

export const OverheatingToolSidebar = observer(function OverheatingToolSidebar() {
  React.useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = "#compliance"
    }
  }, [])
  return (
    <VStack w="full" align="stretch" pt={4}>
      {navSections.map((section) => (
        <React.Fragment key={section.key}>
          <SectionHeader title={section.title} />
          {section.navLinks.map((navLink) => (
            <React.Fragment key={navLink.key}>
              <SectionLink navLink={navLink} />
              {(navLink.subLinks || []).map((subLink) => (
                <SubLink key={subLink.key} subLink={subLink} />
              ))}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
      <Box py={2} w="full" />
    </VStack>
  )
})
