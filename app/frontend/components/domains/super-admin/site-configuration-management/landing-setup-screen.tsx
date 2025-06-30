import { Button, Checkbox, Container, Flex, Heading, TabPanel, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useActivityOptions } from "../../../../hooks/resources/use-activity-options"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { ActivityTabSwitcher } from "../../requirement-template/activity-tab-switcher"
import { DigitalBuildingPermitsList } from "../../requirement-template/digital-building-permits-list"

interface ILandingPageSetupForm {
  templateIds: { id: string }[]
}

export const LandingSetupScreen = observer(() => {
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, landingPageEarlyAccessRequirementTemplateIds } = siteConfigurationStore
  const { activityOptions: allActivityOptions, error: activityOptionsError } = useActivityOptions({
    customErrorMessage: "Error fetching work type options",
  })
  const [searchParams, setSearchParams] = useSearchParams({ earlyAccess: "true" })
  const enabledActivityOptions = allActivityOptions?.filter((option) => option.value.enabled) ?? null
  const activityId = searchParams.get("activityId")

  const { control, handleSubmit, reset } = useForm<ILandingPageSetupForm>({
    defaultValues: { templateIds: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "templateIds",
    keyName: "key",
  })

  useEffect(() => {
    if (landingPageEarlyAccessRequirementTemplateIds) {
      reset({
        templateIds: landingPageEarlyAccessRequirementTemplateIds.map((id) => ({ id })),
      })
    }
  }, [landingPageEarlyAccessRequirementTemplateIds, reset])

  const onSubmit = async (data: ILandingPageSetupForm) => {
    await updateSiteConfiguration({
      landingPageEarlyAccessRequirementTemplateIds: data.templateIds.map((field) => field.id),
    })
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
    return <ErrorScreen error={new Error("Work type not found")} />
  }

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" w="full" px={8}>
          <Heading as="h1" size="2xl">
            {t("siteConfiguration.landingPageSetup.title")}
          </Heading>
          <Text color="text.secondary" my={6}>
            {t("siteConfiguration.landingPageSetup.description")}
          </Text>

          <ActivityTabSwitcher
            selectedTabIndex={selectedTabIndex}
            navigateToActivityTab={navigateToActivityTab}
            enabledActivityOptions={enabledActivityOptions}
          >
            {enabledActivityOptions.map((activityOption) => (
              <TabPanel key={activityOption.value.id} w="100%" px={6}>
                <DigitalBuildingPermitsList
                  activityId={activityOption.value.id}
                  earlyAccess={true}
                  isPublic={true}
                  renderButton={(templateVersion) => {
                    const fieldIndex = fields.findIndex((field) => field.id === templateVersion.requirementTemplateId)
                    return (
                      <Checkbox
                        isChecked={fieldIndex !== -1}
                        onChange={(e) => {
                          if (e.target.checked) {
                            append({ id: templateVersion.requirementTemplateId })
                          } else {
                            remove(fieldIndex)
                          }
                        }}
                      >
                        {t("ui.select")}
                      </Checkbox>
                    )
                  }}
                />
              </TabPanel>
            ))}
          </ActivityTabSwitcher>
          <Button type="submit" variant="primary" mt={6} mr={6} alignSelf={"flex-end"} justifySelf={"flex-end"}>
            {t("ui.save")}
          </Button>
        </Flex>
      </form>
    </Container>
  )
})
