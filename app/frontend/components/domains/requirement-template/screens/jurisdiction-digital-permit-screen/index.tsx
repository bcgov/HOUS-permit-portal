import { Box, Center, Container, Heading, Link, TabPanel, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { usePermitTypeOptions } from "../../../../../hooks/resources/use-permit-type-options"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { PermitTypeTabSwitcher } from "../../permit-type-tab-switcher"
import { TemplateVersionsList } from "../../template-versions-list"

export const JurisdictionDigitalPermitScreen = observer(function JurisdictionDigitalPermitScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { permitTypeOptions: allPermitTypeOptions, error: permitTypeOptionsError } = usePermitTypeOptions({
    publishedOnly: true,
    jurisdictionId: currentUser?.jurisdiction?.id,
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const enabledPermitTypeOptions = allPermitTypeOptions?.filter((option) => option.value.enabled) ?? null
  const permitTypeId = searchParams.get("permitTypeId")

  const navigateToPermitTypeTab = (permitTypeId: string, replace?: boolean) => {
    setSearchParams({ permitTypeId }, { replace })
  }

  useEffect(() => {
    if (!enabledPermitTypeOptions || enabledPermitTypeOptions.length === 0 || permitTypeOptionsError || permitTypeId) {
      return
    }

    const firstPermitTypeId = enabledPermitTypeOptions[0]?.value?.id
    navigateToPermitTypeTab(firstPermitTypeId, true)
  }, [permitTypeId, enabledPermitTypeOptions, permitTypeOptionsError])

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (permitTypeOptionsError) return <ErrorScreen error={permitTypeOptionsError} />
  // Show loading only when: data not loaded yet, OR data has items but permitTypeId not set yet (useEffect will set it)
  if (!enabledPermitTypeOptions || (enabledPermitTypeOptions.length > 0 && !permitTypeId)) return <LoadingScreen />

  // Empty state: no permit types available for this jurisdiction
  if (enabledPermitTypeOptions.length === 0) {
    return (
      <Container maxW="container.lg" w="full" p={8} as="main">
        <Box w="full" px={8}>
          <Heading as="h1" size="2xl" mb={6}>
            {t("digitalBuildingPermits.index.title")}
          </Heading>
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            title={t("digitalBuildingPermits.index.noPermitsAvailable")}
            description={t("digitalBuildingPermits.index.noPermitsAvailableDescription")}
          />
        </Box>
      </Container>
    )
  }

  const selectedTabIndex = enabledPermitTypeOptions.findIndex((option) => option.value.id === permitTypeId)

  if (selectedTabIndex === -1) {
    return <ErrorScreen error={new Error(t("errors.workTypeNotFound"))} />
  }

  return (
    <Container maxW="container.lg" w="full" p={8} as="main">
      <Box w="full" px={8}>
        <Heading as="h1" size="2xl">
          {t("digitalBuildingPermits.index.title")}
        </Heading>
        <Text color="text.secondary" my={6}>
          {t("digitalBuildingPermits.index.selectPermit")}
        </Text>

        <PermitTypeTabSwitcher
          selectedTabIndex={selectedTabIndex}
          navigateToPermitTypeTab={navigateToPermitTypeTab}
          enabledPermitTypeOptions={enabledPermitTypeOptions}
        >
          {enabledPermitTypeOptions.map((permitTypeOption) => (
            <TabPanel key={permitTypeOption.value.id} w="100%" pt={0}>
              <TemplateVersionsList permitTypeId={permitTypeOption.value.id} />
              <Center>
                <Box bg="greys.grey03" p={4} w="75%" mt={24}>
                  <Trans
                    i18nKey="digitalBuildingPermits.index.requestNewPromptWithLink"
                    components={{
                      // This is the component that replaces the <1></1> in your i18n string.
                      // It's an array where each index corresponds to the placeholder number.
                      1: (
                        <Link
                          href={`mailto:digital.codes.permits@gov.bc.ca?subject=New%20permit%20type%20requested`}
                        ></Link>
                      ),
                    }}
                  />
                </Box>
              </Center>
            </TabPanel>
          ))}
        </PermitTypeTabSwitcher>
      </Box>
    </Container>
  )
})
