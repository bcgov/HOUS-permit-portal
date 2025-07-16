import { Divider, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { Files, Info, Steps } from "@phosphor-icons/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../models/jurisdiction"
import { RouterLink } from "../../shared/navigation/router-link"
import StepCodeAddressSearch from "../../shared/step-code-address-search"

interface IStepCodeLookupToolProps {
  showJurisdictionOnPage?: boolean
}

export const StepCodeLookupTool = ({ showJurisdictionOnPage = false }: IStepCodeLookupToolProps) => {
  const { t } = useTranslation()
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction | null>(null)

  const handleJurisdictionFound = (j: IJurisdiction) => {
    setJurisdiction(j)
  }

  return (
    <VStack spacing={4} align="start" w="full" maxW="container.lg" mx="auto" py={10} px={8}>
      <Heading as="h1" variant="yellowline">
        {t("home.projectReadinessTools.stepCodeLookupTool.title")}
      </Heading>
      <Text color="text.secondary" fontSize="lg">
        {t("home.projectReadinessTools.stepCodeLookupTool.description")}
      </Text>
      <StepCodeAddressSearch onJurisdictionFound={showJurisdictionOnPage ? handleJurisdictionFound : undefined} />

      <Text fontSize="lg">
        {t("home.projectReadinessTools.stepCodeLookupTool.cantFindAddress")}{" "}
        <Link as={RouterLink} to="/jurisdictions" color="text.link" textDecoration="underline">
          {t("home.projectReadinessTools.stepCodeLookupTool.browseJurisdictions")}
        </Link>
      </Text>

      {showJurisdictionOnPage && jurisdiction && (
        <VStack w="full" bg="white" p={6} borderRadius="md" align="start" spacing={4}>
          <Heading as="h2" size="lg">
            {jurisdiction.name}
          </Heading>
          <Divider />
          <RouterLink to={`/jurisdictions/${jurisdiction.slug}`}>
            <HStack spacing={4}>
              <Info size={24} />
              <Text as="span" textDecoration="underline" fontSize="lg">
                {t("home.projectReadinessTools.stepCodeLookupTool.checkWhatIsNeededToApplyForPermitsInThisCommunity")}
              </Text>
            </HStack>
          </RouterLink>
          {jurisdiction.inboxEnabled && (
            <>
              <Divider />
              <RouterLink to={`/permit-applications/new`}>
                <HStack spacing={4}>
                  <Files size={24} />
                  <Text as="span" textDecoration="underline" fontSize="lg">
                    {t("home.projectReadinessTools.stepCodeLookupTool.startAPermitApplication")}
                  </Text>
                </HStack>
              </RouterLink>
            </>
          )}
          <Divider />
          <RouterLink to={`/jurisdictions/${jurisdiction.slug}/step-code-requirements`}>
            <HStack spacing={4}>
              <Steps size={24} />
              <Text as="span" textDecoration="underline" fontSize="lg">
                {t(
                  "home.projectReadinessTools.stepCodeLookupTool.lookUpEnergyStepCodeAndZeroCarbonStepCodeRequirements"
                )}
              </Text>
            </HStack>
          </RouterLink>
        </VStack>
      )}
    </VStack>
  )
}
