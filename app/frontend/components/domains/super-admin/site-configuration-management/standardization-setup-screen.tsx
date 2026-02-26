import { Button, Checkbox, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { DigitalBuildingPermitsList } from "../../requirement-template/digital-building-permits-list"

interface IStandardizationSetupForm {
  templateIds: { id: string }[]
}

export const StandardizationSetupScreen = observer(() => {
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, standardizationPageEarlyAccessRequirementTemplateIds } = siteConfigurationStore

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

          <DigitalBuildingPermitsList
            earlyAccess={true}
            isPubliclyPreviewable={true}
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
          <Button type="submit" variant="primary" mt={6} mr={6} alignSelf={"flex-end"} justifySelf={"flex-end"}>
            {t("ui.save")}
          </Button>
        </Flex>
      </form>
    </Container>
  )
})
