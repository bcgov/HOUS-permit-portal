import { Box, Button, Flex, HStack } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useRequirementTemplate } from "../../../../hooks/resources/use-requirement-template"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { ITemplateSectionBlockModel } from "../../../../models/template-section-block"
import { IRequirementTemplateParams } from "../../../../types/api-request"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { BuilderHeader } from "./builder-header"
import { SectionsDisplay } from "./sections-display"
import { SectionsDnd } from "./sections-dnd"

export interface IRequirementTemplateForm extends IRequirementTemplateParams {}

function formFormDefaults(requirementTemplate?: IRequirementTemplate): IRequirementTemplateForm {
  if (!requirementTemplate) {
    return {
      description: "",
      requirementTemplateSectionsAttributes: [],
    }
  }

  const requirementTemplateSectionsAttributes = requirementTemplate.sortedRequirementTemplateSections.map(
    (templateSection) => {
      return {
        id: templateSection.id,
        name: templateSection.name,
        templateSectionBlocksAttributes: R.map(
          (sectionBlocks) => R.pick(["id", "requirementBlockId"], sectionBlocks),
          templateSection.sortedTemplateSectionBlocks as ITemplateSectionBlockModel[]
        ),
      }
    }
  )
  return {
    description: requirementTemplate.description,
    requirementTemplateSectionsAttributes,
  }
}

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  const { requirementTemplate, error } = useRequirementTemplate()
  const { t } = useTranslation()
  const formMethods = useForm({ defaultValues: formFormDefaults(requirementTemplate) })
  const { reset, watch, handleSubmit } = formMethods

  useEffect(() => {
    reset(formFormDefaults(requirementTemplate))
  }, [requirementTemplate?.isFullyLoaded])

  if (error) return <ErrorScreen />
  if (!requirementTemplate?.isFullyLoaded) return <LoadingScreen />

  const watchedSectionsAttributes = watch("requirementTemplateSectionsAttributes")
  const onSubmit = handleSubmit((templateFormData) => {
    templateFormData.requirementTemplateSectionsAttributes.forEach((sectionAttributes, sectionIndex) => {
      sectionAttributes.position = sectionIndex
      sectionAttributes.templateSectionBlocksAttributes.forEach((sectionBlockAttributes, blockIndex) => {
        sectionBlockAttributes.position = blockIndex
      })
    })
  })

  return (
    <Flex flexDir={"column"} w={"full"} flex={1} as="main">
      <FormProvider {...formMethods}>
        <BuilderHeader requirementTemplate={requirementTemplate} />
        <Flex flex={1} borderTop={"1px solid"} borderColor={"border.base"}>
          <SectionsDnd sections={watchedSectionsAttributes} />
          <Box flex={1} h={"full"}>
            <HStack px={6} py={4} bg={"greys.grey03"} w={"full"} justifyContent={"flex-end"}>
              <HStack spacing={4}>
                <Button variant={"primary"} isDisabled>
                  {t("requirementTemplate.edit.saveDraft")}
                </Button>
                <Button variant={"primary"} rightIcon={<CaretRight />} isDisabled>
                  {t("ui.publish")}
                </Button>
              </HStack>
            </HStack>
            <SectionsDisplay />
          </Box>
        </Flex>
      </FormProvider>
    </Flex>
  )
})
