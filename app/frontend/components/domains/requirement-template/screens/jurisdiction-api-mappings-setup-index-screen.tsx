import { Box, Button, Container, Flex, Heading, Tab, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { ETemplateVersionStatus } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { RedirectScreen } from "../../../shared/base/redirect-screen"
import { RouterLink } from "../../../shared/navigation/router-link"
import { SubNavBar } from "../../navigation/sub-nav-bar"
import { DigitalBuildingPermitsList } from "../digital-building-permits-list"

export const JurisdictionApiMappingsSetupIndexScreen = observer(function JurisdictionApiMappingsSetupIndexScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  let templateStatuses = [ETemplateVersionStatus.published, ETemplateVersionStatus.scheduled]
  const [searchParams, setSearchParams] = useSearchParams()
  const status = templateStatuses.find((s) => s === searchParams.get("status"))
  const currentJurisdiction = currentUser?.jurisdiction

  const navigateToStatusTab = (status: ETemplateVersionStatus, replace?: boolean) => {
    setSearchParams({ status }, { replace })
  }

  useEffect(() => {
    if (!status) {
      navigateToStatusTab(ETemplateVersionStatus.published, true)
    }
  }, [status])

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (currentJurisdiction && !currentJurisdiction.externalApiEnabled) {
    return <RedirectScreen path={`/jurisdictions/${currentJurisdiction.slug}/api-settings`} />
  }
  if (!status) return <LoadingScreen />

  const selectedStatusTabIndex = templateStatuses.findIndex((s) => s === status) || 0

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

        <Tabs.Root lazyMount value={selectedStatusTabIndex}>
          <Flex alignItems={"center"}>
            <Box flex={1}>
              <Text color="text.secondary" my={6}>
                {t("apiMappingsSetup.index.helperSubtitle")}
              </Text>

              <Text color="text.secondary" my={6}>
                {t("digitalBuildingPermits.index.selectPermit")}
              </Text>
            </Box>
            <Tabs.List border={"none"} h={"fit-content"}>
              {templateStatuses.map((s) => (
                <Tab key={s} onClick={() => navigateToStatusTab(s)}>
                  {t(`requirementTemplate.status.${s}`)}
                </Tab>
              ))}
            </Tabs.List>
          </Flex>

          <TabPanels>
            {templateStatuses.map((s) => (
              <TabPanel key={s}>
                <DigitalBuildingPermitsList
                  renderButton={(templateVersion) => (
                    <Button
                      disabled={!currentUser?.jurisdiction?.externalApiEnabled}
                      variant={"primary"}
                      ml={4}
                      alignSelf={"center"}
                      asChild
                    >
                      <RouterLink to={`/api-settings/api-mappings/digital-building-permits/${templateVersion.id}/edit`}>
                        {t("ui.manage")}
                      </RouterLink>
                    </Button>
                  )}
                  status={s}
                  statusDisplayOptions={{
                    showStatus: true,
                    showVersionDate: false,
                  }}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs.Root>
      </Box>
    </Container>
  )
})
