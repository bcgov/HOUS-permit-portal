import { Box, Center, Container, Heading, Link, TabPanel, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useActivityOptions } from "../../../../../hooks/resources/use-activity-options"
import { useMst } from "../../../../../setup/root"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { ActivityTabSwitcher } from "../../activity-tab-switcher"
import { DigitalBuildingPermitsList } from "../../digital-building-permits-list"

export const JurisdictionDigitalPermitScreen = observer(function JurisdictionDigitalPermitScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { activityOptions: allActivityOptions, error: activityOptionsError } = useActivityOptions({
    customErrorMessage: t("errors.fetchWorkTypeOptions"),
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const enabledActivityOptions = allActivityOptions?.filter((option) => option.value.enabled) ?? null
  const activityId = searchParams.get("activityId")

  const navigateToActivityTab = (activityId: string, replace?: boolean) => {
    setSearchParams({ activityId }, { replace })
  }
  useEffect(() => {
    if (!enabledActivityOptions || activityOptionsError || activityId) {
      return
    }

    const firstActivityId = enabledActivityOptions[0]?.value?.id

    navigateToActivityTab(firstActivityId, true)
  }, [activityId, enabledActivityOptions, activityOptionsError])

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (activityOptionsError) return <ErrorScreen error={activityOptionsError} />
  if (!enabledActivityOptions || (enabledActivityOptions && !activityId)) return <LoadingScreen />

  const selectedTabIndex = enabledActivityOptions.findIndex((option) => option.value.id === activityId)

  if (enabledActivityOptions.length === 0 || selectedTabIndex === -1) {
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

        <ActivityTabSwitcher
          selectedTabIndex={selectedTabIndex}
          navigateToActivityTab={navigateToActivityTab}
          enabledActivityOptions={enabledActivityOptions}
        >
          {enabledActivityOptions.map((activityOption) => (
            <TabPanel key={activityOption.value.id} w="100%" pt={0}>
              <DigitalBuildingPermitsList activityId={activityOption.value.id} />
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
        </ActivityTabSwitcher>
      </Box>
    </Container>
  )
})
