import { Button, Checkbox, Container, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { useMst } from "../../../setup/root"
import { AsyncRadioGroup } from "../../shared/base/inputs/async-radio-group"
import { TextFormControl } from "../../shared/form/input-form-control"

export type TCreateRequirementTemplateFormData = {
  description: string
  firstNations: boolean
  copyExisting: boolean
  permitTypeId: string
  activityId: string
}

interface INewRequirementTemplateScreenProps {}

export const NewRequirementTemplateScreen = observer(({}: INewRequirementTemplateScreenProps) => {
  const { t } = useTranslation()
  const {
    requirementTemplateStore: { createRequirementTemplate },
    permitClassificationStore: { fetchPermitTypeOptions, fetchActivityOptions },
  } = useMst()

  const formMethods = useForm<TCreateRequirementTemplateFormData>({
    mode: "onChange",
    defaultValues: {
      description: "",
      firstNations: false,
      copyExisting: false,
      permitTypeId: null,
      activityId: null,
    },
  })

  const navigate = useNavigate()
  const { handleSubmit, formState, control } = formMethods

  const firstNationsChecked = useWatch({
    control,
    name: "firstNations",
    defaultValue: false,
  })

  const { isSubmitting } = formState

  const onSubmit = async (formData) => {
    const createdRequirementTemplate = (await createRequirementTemplate(formData)) as IRequirementTemplate
    if (createdRequirementTemplate) {
      navigate(`/requirement-templates/${createdRequirementTemplate.id}/edit`)
    }
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack alignItems={"flex-start"} spacing={5} gap={8} w={"full"} h={"full"}>
            <Heading as="h1" alignSelf="center">
              {t("requirementTemplate.new.title")}
            </Heading>

            <Text>{t("requirementTemplate.new.typePrompt")}</Text>

            <Flex gap={8} w="full" as="section">
              <AsyncRadioGroup
                valueField="id"
                label={t("requirementTemplate.fields.permitType")}
                fetchOptions={fetchPermitTypeOptions}
                fieldName={"permitTypeId"}
              />
              <AsyncRadioGroup
                valueField="id"
                label={t("requirementTemplate.fields.activity")}
                fetchOptions={fetchActivityOptions}
                fieldName={"activityId"}
              />
            </Flex>
            <Controller
              name="firstNations"
              control={control}
              defaultValue={false}
              render={({ field: { onChange, value } }) => (
                <Checkbox isChecked={value} onChange={onChange}>
                  <Trans
                    i18nKey={"requirementTemplate.new.firstNationsLand"}
                    components={{
                      1: (
                        <Link
                          isExternal
                          href="https://services.aadnc-aandc.gc.ca/ILRS_Public/Home/Home.aspx?ReturnUrl=%2filrs_public%2f"
                        ></Link>
                      ),
                    }}
                  />
                </Checkbox>
              )}
            />
            {firstNationsChecked && (
              <Controller
                name="copyExisting"
                control={control}
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                  <Checkbox isChecked={value} onChange={onChange}>
                    {t("requirementTemplate.new.copyExisting")}
                  </Checkbox>
                )}
              />
            )}

            <Flex direction="column" as="section" w="full">
              <TextFormControl label={t("requirementTemplate.fields.description")} fieldName={"description"} required />
              <Text fontSize="sm" color="border.base">
                {t("requirementTemplate.new.descriptionHelpText")}
              </Text>
            </Flex>

            <Flex gap={4}>
              <Button
                variant="primary"
                type="submit"
                isDisabled={!formState.isValid || isSubmitting}
                isLoading={isSubmitting}
                loadingText={t("ui.loading")}
              >
                {t("requirementTemplate.new.createButton")}
              </Button>
              <Button variant="secondary" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
                {t("ui.cancel")}
              </Button>
            </Flex>
          </VStack>
        </form>
      </FormProvider>
    </Container>
  )
})
