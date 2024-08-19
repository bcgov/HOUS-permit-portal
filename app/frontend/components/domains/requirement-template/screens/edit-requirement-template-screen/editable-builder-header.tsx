import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../../../models/requirement-template"
import { ETemplateVersionStatus } from "../../../../../types/enums"
import { EditableInputWithControls } from "../../../../shared/editable-input-with-controls"
import { BuilderHeader } from "./builder-header"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  requirementTemplate: IRequirementTemplate
}

export const EditableBuilderHeader = observer(function EditableBuilderHeader({ requirementTemplate }: IProps) {
  const { t } = useTranslation()
  const { control, register, watch, setValue } = useFormContext<IRequirementTemplateForm>()
  const {
    field: { value: description, onChange: onDescriptionChange },
  } = useController({ control, name: "description" })
  return (
    <BuilderHeader
      breadCrumbs={[
        {
          href: "/requirement-templates",
          title: t("site.breadcrumb.requirementTemplates"),
        },
        {
          href: `/requirements-template${requirementTemplate.id}/edit`,
          title: t("site.breadcrumb.editTemplate"),
        },
      ]}
      requirementTemplate={requirementTemplate}
      status={ETemplateVersionStatus.draft}
      renderDescription={() => (
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.clickToWriteDisplayName")}
          value={description || ""}
          editableInputProps={{
            "aria-label": "Edit Template Description",
          }}
          color={R.isEmpty(description) ? "text.link" : undefined}
          aria-label={"Edit Template Description"}
          onChange={onDescriptionChange}
          onSubmit={onDescriptionChange}
          onCancel={onDescriptionChange}
        />
      )}
    />
  )
})
