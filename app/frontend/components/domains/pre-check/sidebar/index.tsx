import { Box, Divider, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
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

// Links that should be disabled until agreements and consent is complete
const linksRequiringConsent = ["buildingType", "uploadDrawings", "confirmSubmission", "resultsSummary"]

export const Sidebar = observer(function PreCheckSidebar() {
  const { currentPreCheck } = usePreCheck()
  const { siteConfigurationStore } = useMst()
  const { displaySitewideMessage } = siteConfigurationStore

  // Check if agreements and consent section is complete
  const agreementsComplete = currentPreCheck?.isAgreementsAndConsentComplete || false
  const isSubmitted = currentPreCheck?.isSubmitted || false

  return (
    <VStack w="full" align="stretch" pt={displaySitewideMessage ? 20 : 4}>
      {navSections.map((section) => (
        <React.Fragment key={section.key}>
          <SectionHeader title={t(`preCheck.sidebar.sections.${section.key}` as const as any)} />
          {section.navLinks.map((navLink) => {
            const completionKey = completionMap[navLink.key]
            const isComplete = currentPreCheck && completionKey ? currentPreCheck[completionKey] : false

            // Disable logic
            let isDisabled = false

            // Disable links that require consent if agreements are not complete
            if (linksRequiringConsent.includes(navLink.key) && !agreementsComplete) {
              isDisabled = true
            }

            // Disable results summary until pre-check is submitted
            if (navLink.key === "resultsSummary" && !isSubmitted) {
              isDisabled = true
            }

            return <SectionLink key={navLink.key} navLink={navLink} isComplete={isComplete} isDisabled={isDisabled} />
          })}
          <Divider />
        </React.Fragment>
      ))}
      {/* add some padding below the final element */}
      <Box py={2} w="full" />
    </VStack>
  )
})
