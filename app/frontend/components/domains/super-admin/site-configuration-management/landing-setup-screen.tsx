import {
  Box,
  Checkbox,
  Container,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  TabPanel,
  Text,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useActivityOptions } from "../../../../hooks/resources/use-activity-options"
import { useMst } from "../../../../setup/root"
import { ELandingTemplateKeys } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { ActivityTabSwitcher } from "../../requirement-template/activity-tab-switcher"
import { DigitalBuildingPermitsList } from "../../requirement-template/digital-building-permits-list"

export type TLandingForm = {
  [Key in ELandingTemplateKeys]: string
}

export const LandingSetupScreen = observer(function LandingSetupScreen() {
  const { t } = useTranslation()
  const { userStore, siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded, smallScaleRequirementTemplateId } = siteConfigurationStore
  const { activityOptions: allActivityOptions, error: activityOptionsError } = useActivityOptions({
    customErrorMessage: t("errors.fetchWorkTypeOptions"),
  })
  const [searchParams, setSearchParams] = useSearchParams({ earlyAccess: "true" })
  const enabledActivityOptions = allActivityOptions?.filter((option) => option.value.enabled) ?? null
  const activityId = searchParams.get("activityId")

  const navigate = useNavigate()

  const getFormDefaults = () => {
    return {
      [ELandingTemplateKeys.SmallScale]: null,
    }
  }

  const formMethods = useForm<TLandingForm>({
    mode: "onChange",
    defaultValues: getFormDefaults(),
  })

  const { handleSubmit, formState, reset } = formMethods
  const { isSubmitting } = formState

  useEffect(() => {
    reset(getFormDefaults())
  }, [configurationLoaded, reset])

  const onSubmit = async (formData: TLandingForm) => {
    await updateSiteConfiguration(formData)
  }

  const navigateToActivityTab = (activityId: string, replace?: boolean) => {
    setSearchParams({ activityId }, { replace })
  }

  useEffect(() => {
    if (!enabledActivityOptions || activityOptionsError || activityId) {
      return
    }

    const firstActivityId = enabledActivityOptions[0]?.value?.id

    navigateToActivityTab(firstActivityId, true)
  }, [activityId, enabledActivityOptions, activityOptionsError, navigateToActivityTab])

  if (activityOptionsError) return <ErrorScreen error={activityOptionsError} />
  if (!enabledActivityOptions || (enabledActivityOptions && !activityId)) return <LoadingScreen />

  const selectedTabIndex = enabledActivityOptions.findIndex((option) => option.value.id === activityId)

  if (enabledActivityOptions.length === 0 || selectedTabIndex === -1) {
    return <ErrorScreen error={new Error(t("errors.workTypeNotFound"))} />
  }

  // Handler to submit the form with landingAttributes
  const setLandingTemplateSubmitHandler = (landingPageKey: ELandingTemplateKeys, requirementTemplateId: string) => {
    const payload: TLandingForm = {
      [landingPageKey]: requirementTemplateId,
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
        <Box w="full" px={8}>
          <Heading as="h1" size="2xl">
            {t("siteConfiguration.landingPageSetup.title")}
          </Heading>
          <Text color="text.secondary" my={6}>
            {t("siteConfiguration.landingPageSetup.selectOpenAccessPreviews")}
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
                  earlyAccess={true}
                  isPublic={true}
                  renderButton={(templateVersion) => (
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Select Template Version"
                        icon={<CaretDown />}
                        variant="outline"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          onClick={() =>
                            setLandingTemplateSubmitHandler(
                              ELandingTemplateKeys.SmallScale,
                              templateVersion.requirementTemplateId
                            )
                          }
                        >
                          <Checkbox
                            isChecked={smallScaleRequirementTemplateId === templateVersion.requirementTemplateId}
                          >
                            {t("siteConfiguration.landingPageSetup.smallScale")}
                          </Checkbox>
                        </MenuItem>

                        {/* Future items can be handled similarly by adding to this menu*/}
                      </MenuList>
                    </Menu>
                  )}
                />
              </TabPanel>
            ))}
          </ActivityTabSwitcher>
        </Box>
      </Container>
    </form>
  )
})
