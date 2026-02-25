import { Box, Divider, Heading, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { navSections } from "./nav-sections"
import { SectionLink } from "./section-link"

const completionMap: Record<string, string> = {
  introduction: "isIntroductionComplete",
  buildingLocation: "isBuildingLocationComplete",
  coolingZoneCompliance: "isCoolingZoneComplianceComplete",
  designConditions: "isDesignConditionsComplete",
  buildingComponents: "isBuildingComponentsComplete",
  attachedDocuments: "isAttachedDocumentsComplete",
  calculationsPerformedBy: "isCalculationsPerformedByComplete",
}

export const Sidebar = observer(function OverheatingCodeSidebar() {
  const { currentOverheatingCode } = useOverheatingCode()
  const { siteConfigurationStore } = useMst()
  const { displaySitewideMessage } = siteConfigurationStore

  return (
    <VStack w="full" align="stretch" pt={displaySitewideMessage ? 20 : 4}>
      {navSections.map((section) => (
        <React.Fragment key={section.key}>
          <Heading as="h3" fontSize="sm" textTransform="uppercase" px={6} pt={2} my={0}>
            {t(`overheatingCode.sidebar.sections.${section.key}` as const as any)}
          </Heading>
          {section.navLinks.map((navLink) => {
            const completionKey = completionMap[navLink.key]
            const isComplete =
              currentOverheatingCode && completionKey ? !!(currentOverheatingCode as any)[completionKey] : false

            return <SectionLink key={navLink.key} navLink={navLink} isComplete={isComplete} isDisabled={false} />
          })}
          <Divider />
        </React.Fragment>
      ))}
      <Box py={2} w="full" />
    </VStack>
  )
})
