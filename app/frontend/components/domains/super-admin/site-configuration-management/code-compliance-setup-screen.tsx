import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EPreCheckServicePartner } from "../../../../types/enums"
import { IOption } from "../../../../types/types"
import { SwitchButton } from "../../../shared/buttons/switch-button"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { JurisdictionEnrollmentSelect } from "./code-compliance-setup-screen/jurisdiction-enrollment-select"

export const CodeComplianceSetupScreen: React.FC = observer(function CodeComplianceSetupScreen() {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess.codeComplianceSetup"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded, updateJurisdictionEnrollments, fetchJurisdictionEnrollments } =
    siteConfigurationStore
  const [codeComplianceEnabled, setCodeComplianceEnabled] = useState(false)
  const [archistarEnabledForAll, setArchistarEnabledForAll] = useState(false)
  const [enrolledJurisdictions, setEnrolledJurisdictions] = useState<IOption[]>([])
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false)

  const updateCodeComplianceEnabled = async (e) => {
    // optimistic update is fine
    setCodeComplianceEnabled(e.target.checked)
    await updateSiteConfiguration({
      codeComplianceEnabled: e.target.checked,
    })
  }

  const loadEnrolledJurisdictions = async (servicePartner: EPreCheckServicePartner) => {
    if (!codeComplianceEnabled) return

    setIsLoadingEnrollments(true)
    const response = await fetchJurisdictionEnrollments(servicePartner)
    if (response.ok && response.data?.data) {
      const jurisdictions = response.data.data.map((enrollment: any) => ({
        label: enrollment.jurisdictionQualifiedName,
        value: enrollment.jurisdictionId,
      }))
      setEnrolledJurisdictions(jurisdictions)
    }
    setIsLoadingEnrollments(false)
  }

  const handleSaveEnrollments = async (selectedOptions: IOption[]) => {
    const jurisdictionIds = selectedOptions.map((option) => option.value as string)
    await updateJurisdictionEnrollments(EPreCheckServicePartner.archistar, jurisdictionIds)
  }

  const handleToggleEnabledForAll = async (enabled: boolean) => {
    setArchistarEnabledForAll(enabled)
    await updateSiteConfiguration({
      archistarEnabledForAllJurisdictions: enabled,
    })
  }

  useEffect(() => {
    if (configurationLoaded) {
      setCodeComplianceEnabled(siteConfigurationStore.codeComplianceEnabled || false)
      setArchistarEnabledForAll(siteConfigurationStore.archistarEnabledForAllJurisdictions || false)
    }
  }, [configurationLoaded])

  useEffect(() => {
    if (codeComplianceEnabled && configurationLoaded) {
      loadEnrolledJurisdictions(EPreCheckServicePartner.archistar)
    }
  }, [codeComplianceEnabled, configurationLoaded])

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
        <RouterLinkButton
          variant={"link"}
          to={`/configuration-management/global-feature-access/`}
          leftIcon={<CaretLeft size={20} />}
          textDecoration="none"
        >
          {t("ui.back")}
        </RouterLinkButton>
        <Heading as="h1" m={0} p={0}>
          {t(`${i18nPrefix}.title`)}
        </Heading>
        <Text color="text.secondary" m={0} mt={23}>
          {t(`${i18nPrefix}.description`)}
        </Text>
        <Flex pb={4} justify="space-between" w="100%" borderBottom="1px solid" borderColor="border.light">
          <Text fontWeight="bold">{t(`${i18nPrefix}.toggleTitle`)}</Text>
          <SwitchButton isChecked={codeComplianceEnabled} onChange={updateCodeComplianceEnabled} size={"lg"} />
        </Flex>

        {codeComplianceEnabled && (
          <Box w="100%" mt={8}>
            <Heading as="h2" fontSize="xl" mb={2}>
              {t(`${i18nPrefix}.individualServices`)}
            </Heading>
            <Text color="text.secondary" mb={6}>
              {t(`${i18nPrefix}.individualServicesDescription`)}
            </Text>

            <JurisdictionEnrollmentSelect
              servicePartner={EPreCheckServicePartner.archistar}
              value={enrolledJurisdictions}
              enabledForAll={archistarEnabledForAll}
              onChange={setEnrolledJurisdictions}
              onSave={handleSaveEnrollments}
              onToggleEnabledForAll={handleToggleEnabledForAll}
              isLoading={isLoadingEnrollments}
            />
          </Box>
        )}
      </VStack>
    </Container>
  )
})
