import { Box, Container, Divider, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { Files, Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../models/jurisdiction"
import { RouterLink } from "../../shared/navigation/router-link"
import StepCodeAddressSearch from "../../shared/step-code-address-search"
import { LOCAL_COMMUNITY_SECTION_ID } from "./from-your-local-jurisdiction"

interface IFindLocalRequirementsProps {
  jurisdiction: IJurisdiction | null
  hasLocalContext: boolean
  onJurisdictionChange: (jurisdiction: IJurisdiction | null) => void
}

export const FindLocalRequirements = observer(function FindLocalRequirements({
  jurisdiction,
  hasLocalContext,
  onJurisdictionChange,
}: IFindLocalRequirementsProps) {
  const { t } = useTranslation()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (jurisdiction) setShowError(false)
  }, [jurisdiction])

  return (
    <Box as="section" bg="greys.grey03" w="full" py={6}>
      <Container maxW="container.lg" px={{ base: 6, md: 8 }}>
        <Heading as="h2" variant="yellowline" mt={0} mb={2} fontSize="2xl">
          {t("requirementTemplate.explainer.publicPage.findLocalRequirements")}
        </Heading>
        <Text color="text.secondary" mb={6}>
          {t("requirementTemplate.explainer.publicPage.findLocalRequirementsBody")}
        </Text>

        <Heading as="h3" fontSize="2xl" mb={2}>
          {t("requirementTemplate.explainer.publicPage.whereAreYouBuilding")}
        </Heading>
        <Text mb={4}>{t("requirementTemplate.explainer.publicPage.whereAreYouBuildingBody")}</Text>

        <StepCodeAddressSearch
          onJurisdictionFound={(found) => {
            onJurisdictionChange(found)
            if (found) setShowError(false)
          }}
          setShowError={setShowError}
          showError={showError}
        />

        <Text mt={4} color="text.secondary">
          {t("requirementTemplate.explainer.publicPage.dontKnowAddress")}{" "}
          <RouterLink to="/jurisdictions" color="text.link" textDecoration="underline">
            {t("requirementTemplate.explainer.publicPage.browseJurisdictions")}
          </RouterLink>
        </Text>

        {jurisdiction && !showError && (
          <VStack w="full" bg="white" p={6} mt={6} borderRadius="md" align="start" spacing={4}>
            <Heading as="h3" size="lg">
              {jurisdiction.name}
            </Heading>
            {hasLocalContext && (
              <Link
                href={`#${LOCAL_COMMUNITY_SECTION_ID}`}
                onClick={(event) => {
                  const section = document.getElementById(LOCAL_COMMUNITY_SECTION_ID)
                  if (!section) return
                  event.preventDefault()
                  section.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
              >
                <HStack spacing={4}>
                  <Info size={24} color="var(--chakra-colors-semantic-info)" />
                  <Text as="span" textDecoration="underline" fontSize="lg">
                    {t(
                      "home.projectReadinessTools.stepCodeLookupTool.checkWhatIsNeededToApplyForPermitsInThisCommunity"
                    )}
                  </Text>
                </HStack>
              </Link>
            )}
            {jurisdiction.inboxEnabled ? (
              <>
                {hasLocalContext && <Divider />}
                <RouterLink to="/projects/new">
                  <HStack spacing={4}>
                    <Files size={24} color="var(--chakra-colors-semantic-files)" />
                    <Text as="span" textDecoration="underline" fontSize="lg">
                      {t("home.projectReadinessTools.stepCodeLookupTool.startAPermitApplication")}
                    </Text>
                  </HStack>
                </RouterLink>
              </>
            ) : (
              <>
                {hasLocalContext && <Divider />}
                <HStack spacing={4}>
                  <Files size={24} color="var(--chakra-colors-semantic-info)" />
                  <Text as="span" fontSize="lg" ml={2}>
                    {t("home.projectReadinessTools.stepCodeLookupTool.notAcceptingPermitApplications")}
                  </Text>
                </HStack>
              </>
            )}
          </VStack>
        )}
      </Container>
    </Box>
  )
})
