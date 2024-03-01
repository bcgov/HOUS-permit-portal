import { Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, TabProps, Tabs, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useActivityOptions } from "../../../../hooks/resources/use-activity-options"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { DigitalBuildingPermitsList } from "./digital-building-permits-list"

const sharedTabTextStyles = {
  fontSize: "md",
  px: 6,
  py: 2,
  w: "full",
}

const selectedTabStyles = {
  color: "text.link",
  bg: "theme.blueLight",
  borderLeft: "4px solid",
  borderColor: "theme.blue",
  fontWeight: 700,
}

const tabStyles: TabProps = {
  ...sharedTabTextStyles,
  borderLeft: "none",
  justifyContent: "flex-start",
  _active: {
    ...selectedTabStyles,
  },
  _selected: {
    ...selectedTabStyles,
  },
}

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
        <Tabs orientation="vertical" as="article" index={selectedTabIndex} isLazy>
          <TabList borderLeft="none" w="200px">
            <Text as="h2" {...sharedTabTextStyles} fontWeight={700}>
              {t("digitalBuildingPermits.index.workType")}
            </Text>
            {enabledActivityOptions.map((activityOption) => (
              <Tab
                key={activityOption.value.id}
                onClick={() => navigateToActivityTab(activityOption.value.id)}
                {...tabStyles}
              >
                {activityOption.label}
              </Tab>
            ))}
          </TabList>
          <TabPanels flex={1}>
            {enabledActivityOptions.map((activityOption) => (
              <TabPanel key={activityOption.value.id} w="100%" pt={0}>
                <DigitalBuildingPermitsList activityId={activityOption.value.id} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
})
