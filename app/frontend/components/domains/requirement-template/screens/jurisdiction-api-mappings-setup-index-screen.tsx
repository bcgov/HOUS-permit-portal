import { Box, Button, Container, Flex, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useActivityOptions } from "../../../../hooks/resources/use-activity-options"
import { useMst } from "../../../../setup/root"
import { ETemplateVersionStatus } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { RedirectScreen } from "../../../shared/base/redirect-screen"
import { RouterLink } from "../../../shared/navigation/router-link"
import { SubNavBar } from "../../navigation/sub-nav-bar"
import { ActivityTabSwitcher } from "../activity-tab-switcher"
import { DigitalBuildingPermitsList } from "../digital-building-permits-list"

export const JurisdictionApiMappingsSetupIndexScreen = observer(function JurisdictionApiMappingsSetupIndexScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { activityOptions: allActivityOptions, error: activityOptionsError } = useActivityOptions({
    customErrorMessage: t("errors.fetchWorkTypeOptions"),
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const enabledActivityOptions = allActivityOptions?.filter((option) => option.value.enabled) ?? null
  const activityId = searchParams.get("activityId")
  let templateStatuses = [ETemplateVersionStatus.published, ETemplateVersionStatus.scheduled]
  const status = templateStatuses.find((s) => s === searchParams.get("status"))
  const currentJurisdiction = currentUser?.jurisdiction

  const navigateToActivityTab = (activityId: string, replace?: boolean) => {
    setSearchParams({ activityId, status }, { replace })
  }

  const navigateToStatusTab = (status: ETemplateVersionStatus, replace?: boolean) => {
    setSearchParams({ status }, { replace })
  }

  useEffect(() => {
    if (!enabledActivityOptions || activityOptionsError || activityId) {
      return
    }

    const firstActivityId = enabledActivityOptions[0]?.value?.id

    navigateToActivityTab(firstActivityId, true)
  }, [activityId, enabledActivityOptions, activityOptionsError])

  useEffect(() => {
    if (!status) {
      navigateToStatusTab(ETemplateVersionStatus.published, true)
    }
  }, [status])

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (activityOptionsError) return <ErrorScreen error={activityOptionsError} />
  if (!enabledActivityOptions || (enabledActivityOptions && !activityId)) return <LoadingScreen />
  if (currentJurisdiction && !currentJurisdiction.externalApiEnabled) {
    return <RedirectScreen path={`/jurisdictions/${currentJurisdiction.slug}/api-settings`} />
  }

  const selectedActivityTabIndex = enabledActivityOptions.findIndex((option) => option.value.id === activityId) || 0
  const selectedStatusTabIndex = templateStatuses.findIndex((s) => s === status) || 0

  if (enabledActivityOptions.length === 0 || selectedActivityTabIndex === -1) {
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
                <ActivityTabSwitcher
                  selectedTabIndex={selectedActivityTabIndex}
                  navigateToActivityTab={navigateToActivityTab}
                  enabledActivityOptions={enabledActivityOptions}
                >
                  {enabledActivityOptions.map((activityOption) => (
                    <TabPanel key={activityOption.value.id} w="100%" pt={0}>
                      <DigitalBuildingPermitsList
                        activityId={activityOption.value.id}
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
                </ActivityTabSwitcher>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
})
