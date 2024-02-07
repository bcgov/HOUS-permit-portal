import { Box, Button, Flex, HStack, useDisclosure } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useRequirementTemplate } from "../../../../hooks/resources/use-requirement-template"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { ITemplateSectionBlockModel } from "../../../../models/template-section-block"
import { useMst } from "../../../../setup/root"
import { IRequirementTemplateUpdateParams } from "../../../../types/api-request"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { BuilderHeader } from "./builder-header"
import { SectionsDisplay } from "./sections-display"
import { SectionsDnd } from "./sections-dnd"
import { SectionsSidebar } from "./sections-sidebar"

export interface IRequirementTemplateForm extends IRequirementTemplateUpdateParams {}

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
  const { isOpen: isReorderMode, onClose: closeReorderMode, onOpen: openReorderMode } = useDisclosure()
  const { requirementTemplateStore } = useMst()
  const { requirementTemplate, error } = useRequirementTemplate()
  const { t } = useTranslation()
  const formMethods = useForm({ defaultValues: formFormDefaults(requirementTemplate) })
  const navigate = useNavigate()
  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = formMethods

  useEffect(() => {
    reset(formFormDefaults(requirementTemplate))
  }, [requirementTemplate?.isFullyLoaded])

  if (error) return <ErrorScreen />
  if (!requirementTemplate?.isFullyLoaded) return <LoadingScreen />

  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/requirement-templates`)
  }

  const watchedSectionsAttributes = watch("requirementTemplateSectionsAttributes")

  const onSubmit = handleSubmit(async (templateFormData) => {
    templateFormData.requirementTemplateSectionsAttributes.forEach((sectionAttributes, sectionIndex) => {
      sectionAttributes.position = sectionIndex
      sectionAttributes.templateSectionBlocksAttributes.forEach((sectionBlockAttributes, blockIndex) => {
        sectionBlockAttributes.position = blockIndex
      })
    })

    return await requirementTemplateStore.updateRequirementTemplate(requirementTemplate.id, templateFormData)
  })

  return (
    <Flex flexDir={"column"} w={"full"} flex={1} as="main">
      <FormProvider {...formMethods}>
        <BuilderHeader requirementTemplate={requirementTemplate} />
        <Flex flex={1} borderTop={"1px solid"} borderColor={"border.base"}>
          {isReorderMode ? (
            <SectionsDnd sections={watchedSectionsAttributes} onCancel={closeReorderMode} />
          ) : (
            <SectionsSidebar onEdit={openReorderMode} />
          )}
          <Box flex={1} h={"full"}>
            <HStack
              px={6}
              py={4}
              bg={"greys.grey03"}
              w={"full"}
              justifyContent={"flex-end"}
              boxShadow={"elevations.elevation02"}
            >
              <HStack spacing={4}>
                <Button
                  variant={"primary"}
                  isDisabled={isSubmitting || !isValid}
                  isLoading={isSubmitting}
                  onClick={onSubmit}
                >
                  {t("requirementTemplate.edit.saveDraft")}
                </Button>
                <Button variant={"primary"} rightIcon={<CaretRight />} isDisabled>
                  {t("ui.publish")}
                </Button>
                <Button variant={"secondary"} isDisabled={isSubmitting} onClick={onClose}>
                  {t("requirementTemplate.edit.closeEditor")}
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
