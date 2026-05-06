import { Heading, HStack, Separator, Text, VStack } from "@chakra-ui/react"
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
  const [searchedAddress, setSearchedAddress] = useState<string>("")
  const [showError, setShowError] = useState(false)

  const handleJurisdictionFound = (j: IJurisdiction | null, address?: string) => {
    setJurisdiction(j)
    setSearchedAddress(address || "")
    setShowError(false)
  }

  return (
    <VStack gap={4} align="start" w="full" maxW="container.lg" mx="auto">
      <Text color="text.secondary" fontSize="lg">
        {t("home.projectReadinessTools.stepCodeLookupTool.description")}
      </Text>
      <StepCodeAddressSearch
        onJurisdictionFound={showJurisdictionOnPage ? handleJurisdictionFound : undefined}
        setShowError={setShowError}
        showError={showError}
      />
      <Text fontSize="lg" mb={10}>
        {t("home.projectReadinessTools.stepCodeLookupTool.cantFindAddress")}{" "}
        <RouterLink color="text.link" textDecoration="underline" to="/jurisdictions">
          {t("home.projectReadinessTools.stepCodeLookupTool.browseJurisdictions")}
        </RouterLink>
      </Text>
      {showJurisdictionOnPage && jurisdiction && !showError && (
        <VStack w="full" bg="white" p={6} borderRadius="md" align="start" gap={4}>
          <Heading as="h2" size="lg">
            {jurisdiction.name}
          </Heading>
          {jurisdiction.showAboutPage ? (
            <RouterLink to={`/jurisdictions/${jurisdiction.slug}`}>
              <HStack gap={4}>
                <Info size={24} color="var(--chakra-colors-semantic-info)" />
                <Text as="span" textDecoration="underline" fontSize="lg">
                  {t("home.projectReadinessTools.stepCodeLookupTool.checkWhatIsNeededToApplyForPermitsInThisCommunity")}
                </Text>
              </HStack>
            </RouterLink>
          ) : (
            <>
              <Separator />
              <HStack gap={4}>
                <Info size={24} color="var(--chakra-colors-semantic-info)" />
                <Text as="span" fontSize="lg" ml={2}>
                  {t("home.projectReadinessTools.stepCodeLookupTool.permitInformationForThisCommunityIsntAvailable")}
                </Text>
              </HStack>
            </>
          )}
          {jurisdiction.inboxEnabled ? (
            <>
              <Separator />
              <RouterLink to={`/projects/new`}>
                <HStack gap={4}>
                  <Files size={24} color="var(--chakra-colors-semantic-files)" />
                  <Text as="span" textDecoration="underline" fontSize="lg">
                    {t("home.projectReadinessTools.stepCodeLookupTool.projectsNew")}
                  </Text>
                </HStack>
              </RouterLink>
            </>
          ) : (
            <>
              <Separator />
              <HStack gap={4}>
                <Files size={24} color="var(--chakra-colors-semantic-info)" />
                <Text as="span" fontSize="lg" ml={2}>
                  {t("home.projectReadinessTools.stepCodeLookupTool.notAcceptingPermitApplications")}
                </Text>
              </HStack>
            </>
          )}
          <Separator />
          <RouterLink
            to={`/jurisdictions/${jurisdiction.slug}/step-code-requirements?address=${encodeURIComponent(searchedAddress)}`}
          >
            <HStack gap={4}>
              <Steps size={24} color="var(--chakra-colors-semantic-info)" />
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
