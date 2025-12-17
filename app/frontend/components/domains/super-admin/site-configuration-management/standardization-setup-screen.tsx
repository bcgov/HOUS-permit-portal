import { Button, Checkbox, Container, Flex, Heading, TabPanel, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { usePermitTypeOptions } from "../../../../hooks/resources/use-permit-type-options"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { PermitTypeTabSwitcher } from "../../requirement-template/permit-type-tab-switcher"
import { TemplateVersionsList } from "../../requirement-template/template-versions-list"

interface IStandardizationSetupForm {
  templateIds: { id: string }[]
}

export const StandardizationSetupScreen = observer(() => {
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, standardizationPageEarlyAccessRequirementTemplateIds } = siteConfigurationStore
  const { permitTypeOptions: allPermitTypeOptions, error: permitTypeOptionsError } = usePermitTypeOptions()
  const [searchParams, setSearchParams] = useSearchParams({ earlyAccess: "true" })
  const enabledPermitTypeOptions = allPermitTypeOptions?.filter((option) => option.value.enabled) ?? null
  const permitTypeId = searchParams.get("permitTypeId")

  const { control, handleSubmit, reset } = useForm<IStandardizationSetupForm>({
    defaultValues: { templateIds: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "templateIds",
    keyName: "key",
  })

  useEffect(() => {
    if (standardizationPageEarlyAccessRequirementTemplateIds) {
      reset({
        templateIds: standardizationPageEarlyAccessRequirementTemplateIds.map((id) => ({ id })),
      })
    }
  }, [standardizationPageEarlyAccessRequirementTemplateIds, reset])

  const onSubmit = async (data: IStandardizationSetupForm) => {
    await updateSiteConfiguration({
      standardizationPageEarlyAccessRequirementTemplateIds: data.templateIds.map((field) => field.id),
    })
  }

  const navigateToPermitTypeTab = (permitTypeId: string, replace?: boolean) => {
    const earlyAccess = searchParams.get("earlyAccess") ?? "true"
    setSearchParams({ permitTypeId, earlyAccess }, { replace })
  }

  useEffect(() => {
    if (!enabledPermitTypeOptions || permitTypeOptionsError || permitTypeId) {
      return
    }

    const firstPermitTypeId = enabledPermitTypeOptions[0]?.value?.id

    navigateToPermitTypeTab(firstPermitTypeId, true)
  }, [permitTypeId, enabledPermitTypeOptions, permitTypeOptionsError, navigateToPermitTypeTab])

  if (permitTypeOptionsError) return <ErrorScreen error={permitTypeOptionsError} />
  if (!enabledPermitTypeOptions || (enabledPermitTypeOptions && !permitTypeId)) return <LoadingScreen />

  const selectedTabIndex = enabledPermitTypeOptions.findIndex((option) => option.value.id === permitTypeId)

  if (enabledPermitTypeOptions.length === 0 || selectedTabIndex === -1) {
    return <ErrorScreen error={new Error("Work type not found")} />
  }

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" w="full" px={8}>
          <Heading as="h1" size="2xl">
            {t("siteConfiguration.standardizationPageSetup.title")}
          </Heading>
          <Text color="text.secondary" my={6}>
            {t("siteConfiguration.standardizationPageSetup.description")}
          </Text>

          <PermitTypeTabSwitcher
            selectedTabIndex={selectedTabIndex}
            navigateToPermitTypeTab={navigateToPermitTypeTab}
            enabledPermitTypeOptions={enabledPermitTypeOptions}
          >
            {enabledPermitTypeOptions.map((permitTypeOption) => (
              <TabPanel key={permitTypeOption.value.id} w="100%" px={6}>
                <TemplateVersionsList
                  permitTypeId={permitTypeOption.value.id}
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
          </PermitTypeTabSwitcher>
          <Button type="submit" variant="primary" mt={6} mr={6} alignSelf={"flex-end"} justifySelf={"flex-end"}>
            {t("ui.save")}
          </Button>
        </Flex>
      </form>
    </Container>
  )
})
