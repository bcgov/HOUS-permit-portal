import { observer } from "mobx-react-lite"
import React from "react"
import { useRequirementTemplate } from "../../../../hooks/resources/use-requirement-template"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  const { requirementTemplate, error } = useRequirementTemplate()

  if (error) return <ErrorScreen />
  if (!requirementTemplate) return <LoadingScreen />

  return null
})
