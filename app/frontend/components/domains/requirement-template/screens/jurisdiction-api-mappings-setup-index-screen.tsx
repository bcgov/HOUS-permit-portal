import { Box, Button, Container, Flex, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { usePermitTypeOptions } from "../../../../hooks/resources/use-permit-type-options"
import { useMst } from "../../../../setup/root"
import { ETemplateVersionStatus } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { RedirectScreen } from "../../../shared/base/redirect-screen"
import { RouterLink } from "../../../shared/navigation/router-link"
import { SubNavBar } from "../../navigation/sub-nav-bar"
import { PermitTypeTabSwitcher } from "../permit-type-tab-switcher"
import { TemplateVersionsList } from "../template-versions-list"

export const JurisdictionApiMappingsSetupIndexScreen = observer(function JurisdictionApiMappingsSetupIndexScreen() {
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
  let templateStatuses = [ETemplateVersionStatus.published, ETemplateVersionStatus.scheduled]
  const status = templateStatuses.find((s) => s === searchParams.get("status"))
  const currentJurisdiction = currentUser?.jurisdiction

  const navigateToPermitTypeTab = (permitTypeId: string, replace?: boolean) => {
    setSearchParams({ permitTypeId, status }, { replace })
  }

  const navigateToStatusTab = (status: ETemplateVersionStatus, replace?: boolean) => {
    setSearchParams({ status }, { replace })
  }

  useEffect(() => {
    if (!enabledPermitTypeOptions || permitTypeOptionsError || permitTypeId) {
      return
    }

    const firstPermitTypeId = enabledPermitTypeOptions[0]?.value?.id

    navigateToPermitTypeTab(firstPermitTypeId, true)
  }, [permitTypeId, enabledPermitTypeOptions, permitTypeOptionsError])

  useEffect(() => {
    if (!status) {
      navigateToStatusTab(ETemplateVersionStatus.published, true)
    }
  }, [status])

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (permitTypeOptionsError) return <ErrorScreen error={permitTypeOptionsError} />
  if (!enabledPermitTypeOptions || (enabledPermitTypeOptions && !permitTypeId)) return <LoadingScreen />
  if (currentJurisdiction && !currentJurisdiction.externalApiEnabled) {
    return <RedirectScreen path={`/jurisdictions/${currentJurisdiction.slug}/api-settings`} />
  }

  const selectedPermitTypeTabIndex =
    enabledPermitTypeOptions.findIndex((option) => option.value.id === permitTypeId) || 0
  const selectedStatusTabIndex = templateStatuses.findIndex((s) => s === status) || 0

  if (enabledPermitTypeOptions.length === 0 || selectedPermitTypeTabIndex === -1) {
    return <ErrorScreen error={new Error(t("errors.workTypeNotFound"))} />
  }

  const breadCrumbs = [
    {
      href: `/jurisdictions/${currentJurisdiction?.id}/configuration-management`,
      title: t("site.breadcrumb.configurationManagement"),
    },
    {
      href: `/jurisdictions/${currentJurisdiction?.id}/api-settings`,
      title: t("site.breadcrumb.apiSettings"),
    },
    {
      href: "/api-settings/api-mappings",
      title: t("site.breadcrumb.apiMappings"),
    },
  ]

  return (
    <Container maxW="container.lg" w="full" as="main">
      <SubNavBar staticBreadCrumbs={breadCrumbs} borderBottom={"none"} h={"fit-content"} w={"fit-content"} />
      <Box w="full" p={8}>
        <Heading as="h1" size="2xl">
          {t("apiMappingsSetup.title")}
        </Heading>

        <Tabs isLazy index={selectedStatusTabIndex}>
          <Flex alignItems={"center"}>
            <Box flex={1}>
              <Text color="text.secondary" my={6}>
                {t("apiMappingsSetup.index.helperSubtitle")}
              </Text>

              <Text color="text.secondary" my={6}>
                {t("digitalBuildingPermits.index.selectPermit")}
              </Text>
            </Box>
            <TabList border={"none"} h={"fit-content"}>
              {templateStatuses.map((status) => (
                <Tab key={status} onClick={() => navigateToStatusTab(status)}>
                  {t(`requirementTemplate.status.${status}`)}
                </Tab>
              ))}
            </TabList>
          </Flex>

          <TabPanels>
            {templateStatuses.map((status) => (
              <TabPanel key={status}>
                <PermitTypeTabSwitcher
                  selectedTabIndex={selectedPermitTypeTabIndex}
                  navigateToPermitTypeTab={navigateToPermitTypeTab}
                  enabledPermitTypeOptions={enabledPermitTypeOptions}
                >
                  {enabledPermitTypeOptions.map((permitTypeOption) => (
                    <TabPanel key={permitTypeOption.value.id} w="100%" pt={0}>
                      <TemplateVersionsList
                        permitTypeId={permitTypeOption.value.id}
                        renderButton={(templateVersion) => (
                          <Button
                            as={RouterLink}
                            to={`/api-settings/api-mappings/digital-building-permits/${templateVersion.id}/edit`}
                            isDisabled={!currentUser?.jurisdiction?.externalApiEnabled}
                            variant={"primary"}
                            ml={4}
                            alignSelf={"center"}
                          >
                            {t("ui.manage")}
                          </Button>
                        )}
                        status={status}
                        statusDisplayOptions={{
                          showStatus: true,
                          showVersionDate: false,
                        }}
                      />
                    </TabPanel>
                  ))}
                </PermitTypeTabSwitcher>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
})
