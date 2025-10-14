import { Box, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { navSections } from "./nav-sections"
import { SectionHeader } from "./section-header"
import { SectionLink } from "./section-link"

// Map navLink keys to their completion check methods
const completionMap: Record<string, keyof ReturnType<any>> = {
  servicePartner: "isServicePartnerComplete",
  projectAddress: "isProjectAddressComplete",
  agreementsAndConsent: "isAgreementsAndConsentComplete",
  buildingType: "isBuildingTypeComplete",
  uploadDrawings: "isUploadDrawingsComplete",
  confirmSubmission: "isConfirmSubmissionComplete",
  resultsSummary: "isResultsSummaryComplete",
}

export const Sidebar = observer(function PreCheckSidebar() {
  const { currentPreCheck } = usePreCheck()

  return (
    <VStack w="full" align="stretch" pt={4}>
      {navSections.map((section) => (
        <React.Fragment key={section.key}>
          <SectionHeader title={t(`preCheck.sidebar.sections.${section.key}` as const as any)} />
          {section.navLinks.map((navLink) => {
            const completionKey = completionMap[navLink.key]
            const isComplete = currentPreCheck && completionKey ? currentPreCheck[completionKey] : false
            return <SectionLink key={navLink.key} navLink={navLink} isComplete={isComplete} />
          })}
        </React.Fragment>
      ))}
      {/* add some padding below the final element */}
      <Box py={2} w="full" />
    </VStack>
  )
})
