import { Box, Container, Heading, Tab, TabList, TabPanel, TabPanels, TabProps, Tabs, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
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
  const { activityOptions, error: permitTypeOptionsError } = useActivityOptions({
    customErrorMessage: t("errors.fetchWorkTypeOptions"),
  })

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (permitTypeOptionsError) return <ErrorScreen error={permitTypeOptionsError} />
  if (!activityOptions) return <LoadingScreen />

  return (
    <Container maxW="container.lg" w="full" p={8} as="main">
      <Box w="full" px={8}>
        <Heading as="h1" size="2xl">
          {t("digitalBuildingPermits.index.title")}
        </Heading>
        <Text color="text.secondary" my={6}>
          {t("digitalBuildingPermits.index.selectPermit")}
        </Text>
        <Tabs orientation="vertical" as="article" isLazy>
          <TabList borderLeft="none" w="200px">
            <Text as="h2" {...sharedTabTextStyles} fontWeight={700}>
              {t("digitalBuildingPermits.index.workType")}
            </Text>
            {activityOptions.map((permitTypeOption) => (
              <Tab key={permitTypeOption.value.id} {...tabStyles}>
                {permitTypeOption.label}
              </Tab>
            ))}
          </TabList>
          <TabPanels flex={1}>
            {activityOptions.map((permitTypeOption) => (
              <TabPanel key={permitTypeOption.value.id} w="100%">
                <DigitalBuildingPermitsList activityId={permitTypeOption.value.id} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
})
