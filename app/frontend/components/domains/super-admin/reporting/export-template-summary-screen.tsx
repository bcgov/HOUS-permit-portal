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
import { Export, FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { usePermitTypeOptions } from "../../../../hooks/resources/use-permit-type-options"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { PermitTypeTabSwitcher } from "../../requirement-template/permit-type-tab-switcher"
import { TemplateVersionsList } from "../../requirement-template/template-versions-list"

export const ExportTemplateSummaryScreen = observer(function ExportTemplateSummaryScreen() {
  const { t } = useTranslation()
  const { permitTypeOptions: allPermitTypeOptions, error: permitTypeOptionsError } = usePermitTypeOptions()
  const [searchParams, setSearchParams] = useSearchParams()
  const enabledPermitTypeOptions = allPermitTypeOptions?.filter((option) => option.value.enabled) ?? null
  const permitTypeId = searchParams.get("permitTypeId")

  const navigateToPermitTypeTab = (permitTypeId: string, replace?: boolean) => {
    setSearchParams({ permitTypeId }, { replace })
  }

  useEffect(() => {
    if (!enabledPermitTypeOptions || permitTypeOptionsError || permitTypeId) {
      return
    }

    const firstPermitTypeId = enabledPermitTypeOptions[0]?.value?.id

    navigateToPermitTypeTab(firstPermitTypeId, true)
  }, [permitTypeId, enabledPermitTypeOptions, permitTypeOptionsError])

  if (permitTypeOptionsError) return <ErrorScreen error={permitTypeOptionsError} />
  if (!enabledPermitTypeOptions || (enabledPermitTypeOptions && !permitTypeId)) return <LoadingScreen />

  const selectedTabIndex = enabledPermitTypeOptions.findIndex((option) => option.value.id === permitTypeId)

  if (enabledPermitTypeOptions.length === 0 || selectedTabIndex === -1) {
    return <ErrorScreen error={new Error(t("errors.workTypeNotFound"))} />
  }

  return (
    <Container maxW="container.lg" w="full" p={8} as="main">
      <Box w="full" px={8}>
        <Heading as="h1" size="2xl">
          {t("reporting.templateSummary.title")}
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
              <TemplateVersionsList
                permitTypeId={permitTypeOption.value.id}
                renderButton={(templateVersion) => (
                  <Menu>
                    <MenuButton as={Button} aria-label="Options" variant="secondary" rightIcon={<Export />} px={2}>
                      {t("ui.export")}
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={templateVersion.downloadRequirementSummary}>
                        <HStack spacing={2} fontSize={"sm"}>
                          <FileCsv size={24} />
                          <Text as={"span"}>{t("requirementTemplate.export.downloadSummaryCsv")}</Text>
                        </HStack>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
              />
            </TabPanel>
          ))}
        </PermitTypeTabSwitcher>
      </Box>
    </Container>
  )
})
