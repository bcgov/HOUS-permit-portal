import { Box, Flex, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
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
import { ControlsHeader } from "./contros-header"
import { SectionsDisplay } from "./sections-display"
import { SectionsDnd } from "./sections-dnd"
import { SectionsSidebar } from "./sections-sidebar"

export interface IRequirementTemplateForm extends IRequirementTemplateUpdateParams {}

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  const { isOpen: isReorderMode, onClose: closeReorderMode, onOpen: openReorderMode } = useDisclosure()
  const { requirementTemplateStore } = useMst()
  const { requirementTemplate, error } = useRequirementTemplate()
  const formMethods = useForm({ defaultValues: formFormDefaults(requirementTemplate) })
  const { control, reset, watch, setValue, handleSubmit } = formMethods
  const { prepend: prependToSectionsAttributes } = useFieldArray({
    name: `requirementTemplateSectionsAttributes`,
    control,
  })

  useEffect(() => {
    reset(formFormDefaults(requirementTemplate))
  }, [requirementTemplate?.isFullyLoaded])

  if (error) return <ErrorScreen />
  if (!requirementTemplate?.isFullyLoaded) return <LoadingScreen />

  const watchedSectionsAttributes = watch("requirementTemplateSectionsAttributes")

  const onSubmit = handleSubmit(async (templateFormData) => {
    const formattedSubmitData = formatSubmitData(templateFormData)

    return await requirementTemplateStore.updateRequirementTemplate(requirementTemplate.id, formattedSubmitData)
  })

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
            <ControlsHeader onSaveDraft={onSubmit} onAddSection={onAddSection} />

            <SectionsDisplay />
          </Box>
        </Flex>
      </FormProvider>
    </Flex>
  )

  function formatSubmitData(formData: IRequirementTemplateForm) {
    const formattedData = R.clone(formData)

    formattedData.requirementTemplateSectionsAttributes.forEach((sectionAttributes, sectionIndex) => {
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
      const deletedTemplateSectionBlocksAttributes: ITemplateSectionBlockAttributes[] =
        existingMSTSection?.sortedTemplateSectionBlocks
          .filter(
            (sectionBlock) =>
              !sectionAttributes.templateSectionBlocksAttributes.find(
                (blockAttribute) => blockAttribute.id === sectionBlock.id
              )
          )
          .map((sectionBlock) => ({ id: sectionBlock.id, _destroy: true })) ?? []

      // append the deleted templateSectionBlocks to request params
      sectionAttributes.templateSectionBlocksAttributes.unshift(...deletedTemplateSectionBlocksAttributes)
    })

    // mark removed sections to be deleted
    const deletedTemplateSectionsAttributes: ITemplateSectionBlockAttributes[] =
      requirementTemplate?.sortedRequirementTemplateSections
        .filter(
          (section) =>
            !formattedData.requirementTemplateSectionsAttributes.find(
              (sectionAttributes) => sectionAttributes.id === section.id
            )
        )
        .map((section) => ({ id: section.id, _destroy: true })) ?? []

    // append the deleted templateSections to request params
    formattedData.requirementTemplateSectionsAttributes.unshift(...deletedTemplateSectionsAttributes)

    return formattedData
  }

  function onDndComplete(
    dndSectionMap: {
      [key: string]: IRequirementTemplateSectionAttributes
    },
    sortedSectionsId: string[]
  ) {
    const newTemplateSectionsAttributes: IRequirementTemplateSectionAttributes[] = sortedSectionsId.map((sectionID) => {
      return {
        ...dndSectionMap[sectionID],
        requirementTemplateSectionsAttributes: R.clone(dndSectionMap[sectionID].templateSectionBlocksAttributes),
      }
    })

    setValue("requirementTemplateSectionsAttributes", newTemplateSectionsAttributes)
    closeReorderMode()
  }

  function onAddSection() {
    const defaultName = "New Section"
    const numUneditedNewSections = watchedSectionsAttributes.filter((sectionAttributes) =>
      sectionAttributes.name?.startsWith(defaultName)
    ).length

    prependToSectionsAttributes({
      name: `${defaultName} ${numUneditedNewSections + 1}`,
      templateSectionBlocksAttributes: [],
    })
  }
})

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
