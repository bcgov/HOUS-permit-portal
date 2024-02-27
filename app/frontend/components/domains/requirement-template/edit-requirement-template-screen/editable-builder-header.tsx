import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { ETemplateVersionStatus } from "../../../../types/enums"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { BuilderHeader } from "./builder-header"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  requirementTemplate: IRequirementTemplate
}

export const EditableBuilderHeader = observer(function EditableBuilderHeader({ requirementTemplate }: IProps) {
  const { t } = useTranslation()
  const { register, watch, setValue } = useFormContext<IRequirementTemplateForm>()
  const watchedDescription = watch("description")
  return (
    <BuilderHeader
      requirementTemplate={requirementTemplate}
      status={ETemplateVersionStatus.draft}
      renderDescription={() => (
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.clickToWriteDisplayName")}
          value={watchedDescription || ""}
          editableInputProps={{
            ...register("description"),
            "aria-label": "Edit Template Description",
          }}
          color={R.isEmpty(watchedDescription) ? "text.link" : undefined}
          aria-label={"Edit Template Description"}
          onCancel={(previousValue) => setValue("description", previousValue)}
        />
      )}
    />
  )
})
