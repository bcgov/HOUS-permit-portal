import { Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
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

function formFormDefaults(requirementType?: IRequirementTemplate): IRequirementTemplateForm {
  if (!requirementType) {
    return {
      description: "",
      requirementTemplateSectionsAttributes: [
        { id: "A", name: "Section A" },
        { id: "B", name: "Section B" },
        { id: "C", name: "Section C" },
        {
          id: "D",
          name: "Section D",
        },
        { id: "E", name: "Section E" },
      ],
    }
  }

  return {
    description: requirementType.description,
    requirementTemplateSectionsAttributes: [
      { id: "A", name: "Section A" },
      { id: "B", name: "Section B" },
      { id: "C", name: "Section C" },
      {
        id: "D",
        name: "Section D",
      },
      { id: "E", name: "Section D" },
    ],
  }
}

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  const { requirementTemplate, error } = useRequirementTemplate()
  const { t } = useTranslation()
  const formMethods = useForm({ defaultValues: formFormDefaults(requirementTemplate) })
  const { reset } = formMethods

  useEffect(() => {
    reset(formFormDefaults(requirementTemplate))
  }, [requirementTemplate])

  if (error) return <ErrorScreen />
  if (!requirementTemplate) return <LoadingScreen />

  return (
    <Flex flexDir={"column"} w={"full"} flex={1} as="main">
      <FormProvider {...formMethods}>
        <BuilderHeader requirementTemplate={requirementTemplate} />
        <Flex flex={1} borderTop={"1px solid"} borderColor={"border.base"}>
          <SectionsDnd />
        </Flex>
      </FormProvider>
    </Flex>
  )
})
