import { Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useRequirementTemplate } from "../../../../hooks/resources/use-requirement-template"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { IRequirementTemplateParams } from "../../../../types/api-request"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { BuilderHeader } from "./builder-header"
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
          templateSection.sortedTemplateSectionBlocks
        ),
      }
    }
  )
  console.log("here 2", requirementTemplateSectionsAttributes)
  return {
    description: requirementTemplate.description,
    requirementTemplateSectionsAttributes,
  }
}

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  const { requirementTemplate, error } = useRequirementTemplate()
  const { t } = useTranslation()
  const formMethods = useForm({ defaultValues: formFormDefaults(requirementTemplate) })
  const { reset, watch } = formMethods

  useEffect(() => {
    reset(formFormDefaults(requirementTemplate))
  }, [requirementTemplate?.isFullyLoaded])

  if (error) return <ErrorScreen />
  if (!requirementTemplate?.isFullyLoaded) return <LoadingScreen />

  const watchedSectionsAttributes = watch("requirementTemplateSectionsAttributes")

  console.log("watchedSectionsAttributes", requirementTemplate.isFullyLoaded, watchedSectionsAttributes)
  return (
    <Flex flexDir={"column"} w={"full"} flex={1} as="main">
      <FormProvider {...formMethods}>
        <BuilderHeader requirementTemplate={requirementTemplate} />
        <Flex flex={1} borderTop={"1px solid"} borderColor={"border.base"}>
          <SectionsDnd sections={watchedSectionsAttributes} />
        </Flex>
      </FormProvider>
    </Flex>
  )
})
