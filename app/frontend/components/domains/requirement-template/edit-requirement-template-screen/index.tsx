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
import {
  IRequirementTemplateSectionAttributes,
  IRequirementTemplateUpdateParams,
  ITemplateSectionBlockAttributes,
} from "../../../../types/api-request"
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
    setValue,
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
      const existingMSTSection = requirementTemplate.getRequirementSectionById(sectionAttributes.id)

      sectionAttributes.position = sectionIndex
      sectionAttributes.templateSectionBlocksAttributes.forEach((sectionBlockAttributes, blockIndex) => {
        // if the section is new or if the block is moved to this section
        // from another section, then we set the id to null so that it get's created
        // on the new section by rails.
        if (!existingMSTSection || !existingMSTSection.hasTemplateSectionBlock(sectionBlockAttributes.id)) {
          sectionBlockAttributes.id = null
        }
        sectionBlockAttributes.position = blockIndex
      })

      // mark removed or moved templateSectionBlocks to be deleted
      const deletedTemplateSectionBlockIds: ITemplateSectionBlockAttributes[] =
        existingMSTSection?.sortedTemplateSectionBlocks
          .filter(
            (sectionBlock) =>
              !sectionAttributes.templateSectionBlocksAttributes.find(
                (blockAttribute) => blockAttribute.id === sectionBlock.id
              )
          )
          .map((sectionBlock) => ({ id: sectionBlock.id, _destroy: true })) ?? []

      // append the deleted templateSectionBlocks to request params
      sectionAttributes.templateSectionBlocksAttributes.unshift(...deletedTemplateSectionBlockIds)
    })

    return await requirementTemplateStore.updateRequirementTemplate(requirementTemplate.id, templateFormData)
  })

  const onDndComplete = (
    dndSectionMap: {
      [key: string]: IRequirementTemplateSectionAttributes
    },
    sortedSectionsId: string[]
  ) => {
    const newTemplateSectionsAttributes: IRequirementTemplateSectionAttributes[] = sortedSectionsId.map((sectionID) => {
      return {
        ...dndSectionMap[sectionID],
        requirementTemplateSectionsAttributes: R.clone(dndSectionMap[sectionID].templateSectionBlocksAttributes),
      }
    })

    setValue("requirementTemplateSectionsAttributes", newTemplateSectionsAttributes)
    closeReorderMode()
  }

  return (
    <Flex flexDir={"column"} w={"full"} maxW={"full"} overflowX={"hidden"} flex={1} as="main">
      <FormProvider {...formMethods}>
        <BuilderHeader requirementTemplate={requirementTemplate} />
        <Flex flex={1} borderTop={"1px solid"} borderColor={"border.base"}>
          {isReorderMode ? (
            <SectionsDnd sections={watchedSectionsAttributes} onCancel={closeReorderMode} onDone={onDndComplete} />
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
