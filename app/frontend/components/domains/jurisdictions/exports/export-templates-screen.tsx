import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  TabPanel,
  Text,
} from "@chakra-ui/react"
import { BracketsCurly, Export, FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useActivityOptions } from "../../../../hooks/resources/use-activity-options"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { EExportFormat } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { ActivityTabSwitcher } from "../../requirement-template/activity-tab-switcher"
import { DigitalBuildingPermitsList } from "../../requirement-template/digital-building-permits-list"

export const ExportTemplatesScreen = observer(function JurisdictionSubmissionInbox() {
  const { t } = useTranslation()
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

  const { currentJurisdiction, error: jurisdictionError } = useJurisdiction()

  if (activityOptionsError) return <ErrorScreen error={activityOptionsError} />
  if (jurisdictionError) return <ErrorScreen error={jurisdictionError} />
  if (!currentJurisdiction || !enabledActivityOptions || (enabledActivityOptions && !activityId))
    return <LoadingScreen />

  const selectedTabIndex = enabledActivityOptions.findIndex((option) => option.value.id === activityId)

  if (enabledActivityOptions.length === 0 || selectedTabIndex === -1) {
    return <ErrorScreen error={new Error(t("errors.workTypeNotFound"))} />
  }

  return (
    <Container maxW="container.lg" w="full" p={8} as="main">
      <Box w="full" px={8}>
        <Heading as="h1" size="2xl">
          {t("requirementTemplate.export.title")}
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
              <DigitalBuildingPermitsList
                activityId={activityOption.value.id}
                renderButton={(templateVersion) => (
                  <Menu>
                    <MenuButton as={Button} aria-label="Options" variant="secondary" rightIcon={<Export />} px={2}>
                      {t("ui.export")}
                    </MenuButton>
                    <MenuList>
                      <MenuItem
                        onClick={() => templateVersion.downloadExport(currentJurisdiction.id, EExportFormat.csv)}
                      >
                        <HStack spacing={2} fontSize={"sm"}>
                          <FileCsv size={24} />
                          <Text as={"span"}>{t("requirementTemplate.export.downloadCustomizationCsv")}</Text>
                        </HStack>
                      </MenuItem>
                      <MenuItem
                        onClick={() => templateVersion.downloadExport(currentJurisdiction.id, EExportFormat.json)}
                      >
                        <HStack spacing={2} fontSize={"sm"}>
                          <BracketsCurly size={24} />
                          <Text as={"span"}>{t("requirementTemplate.export.downloadCustomizationJson")}</Text>
                        </HStack>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
              />
            </TabPanel>
          ))}
        </ActivityTabSwitcher>
      </Box>
    </Container>
  )
})
