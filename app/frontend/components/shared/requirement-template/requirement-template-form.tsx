import { Button, Flex, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { useMst } from "../../../setup/root"
import { ERequirementTemplateType } from "../../../types/enums"
import { TCreateRequirementTemplateFormData } from "../../../types/types"
import { TextFormControl } from "../form/input-form-control"
import { TagsSelect } from "../select/selectors/tags-select"

interface IRequirementTemplateFormProps {
  type: ERequirementTemplateType
  onSuccess: (createdRequirementTemplate: IRequirementTemplate) => void
}

export const RequirementTemplateForm = observer(({ type, onSuccess }: IRequirementTemplateFormProps) => {
  const { t } = useTranslation()
  const {
    requirementTemplateStore: { createRequirementTemplate, searchTagOptions },
  } = useMst()

  const formMethods = useForm<TCreateRequirementTemplateFormData>({
    mode: "onChange",
    defaultValues: {
      description: "",
      tags: [],
    },
  })

  const navigate = useNavigate()
  const { handleSubmit, formState, control } = formMethods

  const { isSubmitting } = formState

  const fetchTagOptions = async (query: string) => {
    const options = await searchTagOptions(query)
    return options ?? []
  }

  const onSubmit = async (formData) => {
    formData.type = type

    const createdRequirementTemplate = await createRequirementTemplate(formData)

    if (createdRequirementTemplate) {
      onSuccess(createdRequirementTemplate)
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack alignItems={"flex-start"} spacing={5} gap={8} w={"full"} h={"full"}>
          <Text>{t("requirementTemplate.new.typePrompt")}</Text>

          <Flex direction="column" as="section" w="full">
            <Text fontWeight={700} mb={2}>
              {t("requirementTemplate.fields.tags")}
            </Text>
            <Controller
              name="tags"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TagsSelect
                  onChange={(options) => onChange(options.map((o) => o.value))}
                  fetchOptions={fetchTagOptions}
                  placeholder={t("requirementTemplate.fields.tags")}
                  selectedOptions={(value ?? []).map((tag) => ({ value: tag, label: tag }))}
                  styles={{
                    container: (css) => ({ ...css, width: "100%" }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={document.body}
                />
              )}
            />
          </Flex>

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
  )
})
