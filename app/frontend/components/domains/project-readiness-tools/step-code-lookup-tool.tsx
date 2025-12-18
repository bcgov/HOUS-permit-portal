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
  const [searchedAddress, setSearchedAddress] = useState<string>("")
  const [showError, setShowError] = useState(false)

  const handleJurisdictionFound = (j: IJurisdiction | null, address?: string) => {
    setJurisdiction(j)
    setSearchedAddress(address || "")
    setShowError(false)
  }

  return (
    <VStack spacing={4} align="start" w="full" maxW="container.lg" mx="auto">
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
        <Link as={RouterLink} to="/jurisdictions" color="text.link" textDecoration="underline">
          {t("home.projectReadinessTools.stepCodeLookupTool.browseJurisdictions")}
        </Link>
      </Text>

      {showJurisdictionOnPage && jurisdiction && !showError && (
        <VStack w="full" bg="white" p={6} borderRadius="md" align="start" spacing={4}>
          <Heading as="h2" size="lg">
            {jurisdiction.name}
          </Heading>
          {jurisdiction.showAboutPage ? (
            <RouterLink to={`/jurisdictions/${jurisdiction.slug}`}>
              <HStack spacing={4}>
                <Info size={24} color="var(--chakra-colors-semantic-info)" />
                <Text as="span" textDecoration="underline" fontSize="lg">
                  {t("home.projectReadinessTools.stepCodeLookupTool.checkWhatIsNeededToApplyForPermitsInThisCommunity")}
                </Text>
              </HStack>
            </RouterLink>
          ) : (
            <>
              <Divider />
              <HStack spacing={4}>
                <Info size={24} color="var(--chakra-colors-semantic-info)" />
                <Text as="span" fontSize="lg" ml={2}>
                  {t("home.projectReadinessTools.stepCodeLookupTool.permitInformationForThisCommunityIsntAvailable")}
                </Text>
              </HStack>
            </>
          )}
          {jurisdiction.inboxEnabled ? (
            <>
              <Divider />
              <RouterLink to={`/projects/new`}>
                <HStack spacing={4}>
                  <Files size={24} color="var(--chakra-colors-semantic-files)" />
                  <Text as="span" textDecoration="underline" fontSize="lg">
                    {t("home.projectReadinessTools.stepCodeLookupTool.projectsNew")}
                  </Text>
                </HStack>
              </RouterLink>
            </>
          ) : (
            <>
              <Divider />
              <HStack spacing={4}>
                <Files size={24} color="var(--chakra-colors-semantic-info)" />
                <Text as="span" fontSize="lg" ml={2}>
                  {t("home.projectReadinessTools.stepCodeLookupTool.notAcceptingPermitApplications")}
                </Text>
              </HStack>
            </>
          )}
          <Divider />
          <RouterLink
            to={`/jurisdictions/${jurisdiction.slug}/step-code-requirements?address=${encodeURIComponent(searchedAddress)}`}
          >
            <HStack spacing={4}>
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
